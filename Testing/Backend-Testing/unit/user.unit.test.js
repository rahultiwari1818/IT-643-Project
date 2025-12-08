import {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
  getConversations,
  getUsers,
  getAllUsers,
  getUserDetails,
  inviteFriend,
  changeProfilePic,
  blockUser,
  unblockUser,
  resetPassword,
  updateName,
} from "../../../Server/src/controllers/user.controller.js";

import User from "../../../Server/src/models/users.models.js";
import Conversation from "../../../Server/src/models/conversation.model.js";
import Group from "../../../Server/src/models/group.model.js";
import GroupMessages from "../../../Server/src/models/groupMessages.model.js";

import { sendMail } from "../../../Server/src/config/mail.config.js";
import { client } from "../../../Server/src/config/redis.config.js";
import {
  generateHashPassword,
  generateOTP,
  verifyPassword,
  generateToken,
} from "../../../Server/src/utils/utils.js";

import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../../../Server/src/config/cloudinary.config.js";

import { getReceiverSocketId, io, isUserOnline } from "../../../Server/src/socket/app.socket.js";

// ----- Mock Modules -----
jest.mock("../../../Server/src/models/users.models.js");
jest.mock("../../../Server/src/models/conversation.model.js");
jest.mock("../../../Server/src/models/group.model.js");
jest.mock("../../../Server/src/models/groupMessages.model.js");
jest.mock("../../../Server/src/config/mail.config.js");
jest.mock("../../../Server/src/config/redis.config.js");
jest.mock("../../../Server/src/config/cloudinary.config.js");
jest.mock("../../../Server/src/utils/utils.js");
jest.mock("../../../Server/src/socket/app.socket.js", () => ({
  getReceiverSocketId: jest.fn(),
  io: { to: jest.fn().mockReturnValue({ emit: jest.fn() }) },
  isUserOnline: jest.fn(),
}));

// ----- Mock Response Object -----
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("User Controller Unit Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- REGISTER USER ----------------
  it("registerUser → return 401 if user exists", async () => {
    const req = { body: { mail: "test@mail.com", password: "123", name: "AB" } };
    const res = mockResponse();

    User.findOne.mockResolvedValue({ email: "test@mail.com" });

    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("registerUser → return 201 on success", async () => {
    const req = { body: { mail: "new@mail.com", password: "123", name: "Test User" } };
    const res = mockResponse();

    User.findOne.mockResolvedValue(null);
    generateHashPassword.mockResolvedValue("hashedPass");
    User.create.mockResolvedValue({});

    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // ---------------- LOGIN USER ----------------
  it("loginUser → return 400 if missing credentials", async () => {
    const req = { body: { mail: "", password: "" } };
    const res = mockResponse();

    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("loginUser → return 200 on success", async () => {
    const req = { body: { mail: "test@mail.com", password: "123" } };
    const res = mockResponse();

    User.findOne.mockResolvedValue({
      email: "test@mail.com",
      password: "hashed",
      blockedUsers: [],
    });
    verifyPassword.mockResolvedValue(true);
    generateToken.mockReturnValue("mockToken");

    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ---------------- SEND OTP ----------------
  it("sendOTP → return 400 if no email", async () => {
    const req = { body: {} };
    const res = mockResponse();

    await sendOTP(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("sendOTP → return 200 when OTP sent", async () => {
    const req = { body: { email: "abc@mail.com" } };
    const res = mockResponse();

    generateOTP.mockReturnValue("1234");
    client.set.mockResolvedValue();
    sendMail.mockResolvedValue({ result: true });

    await sendOTP(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ---------------- VERIFY OTP ----------------
  it("verifyOTP → return 401 for invalid OTP", async () => {
    const req = { body: { mail: "abc@mail.com", otp: "123" } };
    const res = mockResponse();

    client.get.mockResolvedValue("999");

    await verifyOTP(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  // ---------------- GET USERS ----------------
  it("getUsers → return 200 with filtered list", async () => {
    const req = { user: { _id: "u1" }, query: {} };
    const res = mockResponse();

    User.find.mockResolvedValue([{ _id: "u2" }]);
    Conversation.find.mockResolvedValue([]);

    await getUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ---------------- INVITE FRIEND ----------------
  it("inviteFriend → return 400 if inviting yourself", async () => {
    const req = { user: { name: "Test", email: "a@mail.com" }, body: { friendMail: "a@mail.com" } };
    const res = mockResponse();

    await inviteFriend(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ---------------- CHANGE PROFILE PIC ----------------
  it("changeProfilePic → return 400 if no file uploaded", async () => {
    const req = { user: { _id: "u1" }, file: null };
    const res = mockResponse();

    await changeProfilePic(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ---------------- BLOCK USER ----------------
  it("blockUser → return 200 on success", async () => {
    const req = { user: { _id: "u1" }, params: { userIdToBlock: "u2" } };
    const res = mockResponse();

    User.findByIdAndUpdate.mockResolvedValue({});
    getReceiverSocketId.mockReturnValue("sock1");

    await blockUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ---------------- UNBLOCK USER ----------------
  it("unblockUser → return 200 on success", async () => {
    const req = { user: { _id: "u1" }, params: { userIdToUnblock: "u2" } };
    const res = mockResponse();

    User.findByIdAndUpdate.mockResolvedValue({});

    await unblockUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ---------------- RESET PASSWORD ----------------
  it("resetPassword → return 400 if empty password", async () => {
    const req = { user: { email: "abc@mail.com" }, body: { newPassword: "" } };
    const res = mockResponse();

    await resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ---------------- UPDATE NAME ----------------
  it("updateName → return 400 if empty name", async () => {
    const req = { user: { _id: "u1" }, body: { name: "" } };
    const res = mockResponse();

    await updateName(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
