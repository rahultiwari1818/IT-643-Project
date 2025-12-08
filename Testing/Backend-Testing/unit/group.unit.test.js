import {
  creategroup,
  getChat,
  sendGroupMessage,
  deleteGroupMessage,
  deleteGroupMessageForEveryone,
  addMembers,
  removeMembers,
  leaveGroup,
  makeAdmin,
  removeAdmin,
  changeDescription,
  changeGroupIcon,
  clearGroupChat,
  deleteMedia,
} from "../../../Server/src/controllers/group.controller.js";

import Group from "../../../Server/src/models/group.model.js";
import GroupMessages from "../../../Server/src/models/groupMessages.model.js";
import User from "../../../Server/src/models/users.models.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../../../Server/src/config/cloudinary.config.js";
import {
  getReceiverSocketId,
  io,
  isUserOnline,
} from "../../../Server/src/socket/app.socket.js";

// Mock modules
jest.mock("../../../Server/src/models/group.model.js");
jest.mock("../../../Server/src/models/groupMessages.model.js");
jest.mock("../../../Server/src/models/users.models.js");
jest.mock("../../../Server/src/config/cloudinary.config.js");
jest.mock("../../../Server/src/socket/app.socket.js", () => ({
  getReceiverSocketId: jest.fn(),
  io: { to: jest.fn().mockReturnValue({ emit: jest.fn() }) },
  isUserOnline: jest.fn(),
}));

// Mock Response
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Group Controller Unit Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- CREATE GROUP ----------------
  it("creategroup → return 400 if inputs missing", async () => {
    const req = { body: {}, user: { _id: "123" } };
    const res = mockResponse();

    await creategroup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("creategroup → return 201 for success", async () => {
    const req = {
      body: { groupName: "Test Group", selectedUsers: "u1,u2" },
      file: null,
      user: { _id: "admin" },
    };
    const res = mockResponse();

    Group.create.mockResolvedValue({ _id: "g1" });
    Group.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: "g1",
        name: "Test Group",
        groupIcon: "",
        members: [],
      }),
    });

    await creategroup(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // ---------------- GET CHAT ----------------
  it("getChat → return 200 with empty chat", async () => {
    const req = { params: { groupId: "g1" }, user: { _id: "123" } };
    const res = mockResponse();

    GroupMessages.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    });

    await getChat(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ result: true })
    );
  });

  // ---------------- SEND MESSAGE ----------------
  it("sendGroupMessage → return 400 on missing content", async () => {
    const req = {
      body: { message: "", recipient: "g1" },
      files: [],
      user: { _id: "u1" },
    };
    const res = mockResponse();

    Group.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ members: [] }),
    });

    await sendGroupMessage(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("sendGroupMessage → return 201 on success", async () => {
    const req = {
      body: { message: "Hello", recipient: "g1" },
      files: [],
      user: { _id: "u1" },
    };
    const res = mockResponse();

    Group.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ members: [{ userId: "u2" }] }),
    });

    GroupMessages.prototype.save = jest.fn();
    User.findById = jest
      .fn()
      .mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: "u1" }) });

    getReceiverSocketId.mockReturnValue(null);

    await sendGroupMessage(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // ---------------- DELETE MESSAGE ----------------
  it("deleteGroupMessage → return 404 if not found", async () => {
    GroupMessages.findById.mockResolvedValue(null);
    const req = { params: { messageId: "m1" }, user: { _id: "u1" } };
    const res = mockResponse();

    await deleteGroupMessage(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // ---------------- DELETE MEDIA ----------------
  it("deleteMedia → return 400 if URL missing", async () => {
    const req = { body: {}, params: { id: "m1" } };
    const res = mockResponse();

    await deleteMedia(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ---------------- ADD MEMBERS ----------------
  it("addMembers → return 404 if group not found", async () => {
    Group.findById.mockResolvedValue(null);
    const req = {
      params: { groupId: "g1" },
      body: { userIds: [] },
      user: { _id: "u1" },
    };
    const res = mockResponse();

    await addMembers(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // ---------------- REMOVE MEMBERS ----------------
  it("removeMembers → return 400 if missing params", async () => {
    const req = { params: {}, body: {} };
    const res = mockResponse();

    await removeMembers(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ---------------- LEAVE GROUP ----------------
  it("leaveGroup → return 404 if not found", async () => {
    Group.findByIdAndUpdate.mockResolvedValue(null);
    const req = { params: { groupId: "g1" }, user: { _id: "u1" } };
    const res = mockResponse();

    await leaveGroup(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
