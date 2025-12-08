import { googleAuth } from "../../../Server/src/controllers/googleAuth.controller.js";
import { oauth2Client } from "../../../Server/src/config/googleAuth.config.js";
import User from "../../../Server/src/models/users.models.js";
import axios from "axios";
import { generateToken } from "../../../Server/src/utils/utils.js";

// ----- Mock Dependencies -----
jest.mock("../../../Server/src/models/users.models.js");
jest.mock("../../../Server/src/config/googleAuth.config.js", () => ({
  oauth2Client: {
    getToken: jest.fn(),
    setCredentials: jest.fn(),
  },
}));


jest.mock("axios", () => ({
  get: jest.fn(),
}));

jest.mock("../../../Server/src/utils/utils.js", () => ({
  generateToken: jest.fn(),
}));

// ----- Mock Response Object -----
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Google Auth Controller Unit Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------- Missing Code ----------
  it("googleAuth → return 500 if missing authorization code", async () => {
    const req = { query: {} };
    const res = mockResponse();

    await googleAuth(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ---------- SUCCESS: EXISTING USER ----------
  it("googleAuth → return 200 for existing user", async () => {
    const req = { query: { code: "abc123" } };
    const res = mockResponse();

    oauth2Client.getToken.mockResolvedValue({
      tokens: { access_token: "mockAccessToken" },
    });

    axios.get.mockResolvedValue({
      data: { email: "test@mail.com", name: "Test User" },
    });

    User.findOne.mockResolvedValue({
      _id: "u1",
      name: "Test User",
      email: "test@mail.com",
    });

    generateToken.mockReturnValue("mockToken");

    await googleAuth(req, res);

    expect(oauth2Client.getToken).toHaveBeenCalledWith("abc123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        result: true,
        token: "mockToken",
        email: "test@mail.com",
      })
    );
  });

  // ---------- SUCCESS: NEW USER CREATED ----------
  it("googleAuth → create new user if not found", async () => {
    const req = { query: { code: "xyz987" } };
    const res = mockResponse();

    oauth2Client.getToken.mockResolvedValue({
      tokens: { access_token: "access123" },
    });

    axios.get.mockResolvedValue({
      data: { email: "new@mail.com", name: "New User" },
    });

    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: "u10",
      email: "new@mail.com",
      name: "New User",
    });

    generateToken.mockReturnValue("mockToken2");

    await googleAuth(req, res);

    expect(User.create).toHaveBeenCalledWith({
      email: "new@mail.com",
      name: "New User",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        result: true,
        token: "mockToken2",
        email: "new@mail.com",
      })
    );
  });

  // ---------- INTERNAL SERVER ERROR ----------
  it("googleAuth → return 500 on exception", async () => {
    const req = { query: { code: "boom" } };
    const res = mockResponse();

    oauth2Client.getToken.mockRejectedValue(new Error("Failed"));

    await googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Internal Server Error" })
    );
  });
});
