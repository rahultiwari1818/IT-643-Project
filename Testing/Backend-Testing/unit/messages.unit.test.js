/**
 * Unit Tests for Messages Controller
 */

import {
  getMessages,
  sendMessage,
  deleteMessage,
  deleteForEveryone,
  clearChat,
  markAsRead,
  deleteMedia,
} from "../../../Server/src/controllers/messages.controller.js";

import Conversation from "../../../Server/src/models/conversation.model.js";
import Messages from "../../../Server/src/models/messages.models.js";
import User from "../../../Server/src/models/users.models.js";

import {
  getReceiverSocketId,
  io,
  isUserOnline,
  saveOfflineMessage,
} from "../../../Server/src/socket/app.socket.js";

jest.mock("../../../Server/src/models/conversation.model.js");
jest.mock("../../../Server/src/models/messages.models.js");
jest.mock("../../../Server/src/models/users.models.js");
jest.mock("../../../Server/src/socket/app.socket.js", () => ({
  getReceiverSocketId: jest.fn(),
  io: { to: jest.fn(() => ({ emit: jest.fn() })) },
  isUserOnline: jest.fn(),
  saveOfflineMessage: jest.fn(),
}));

// MOCK RESPONSE OBJECT
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Messages Controller Unit Tests", () => {
  // ---------------------- GET MESSAGES ---------------------- //
  describe("getMessages", () => {
    it("should return empty list if conversation not found", async () => {
      const req = {
        params: { recipientId: "456" },
        user: { _id: "123" },
      };
      const res = mockResponse();

      Conversation.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await getMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: [], result: true })
      );
    });
  });

  // --------------------- SEND MESSAGE ---------------------- //
  describe("sendMessage", () => {
    it("should return 400 if message and media missing", async () => {
      const req = {
        body: { message: "", medias: [] },
        files: [],
        user: { _id: "123" },
      };
      const res = mockResponse();

      await sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Either message or media is required",
        })
      );
    });

    it("should create message & return success", async () => {
      const req = {
        body: { message: "Hello", recipient: "456" },
        user: { _id: "123" },
        files: [],
      };
      const res = mockResponse();

      Messages.prototype.save = jest.fn();
      Messages.findById = jest.fn().mockReturnValue({
        populate: jest
          .fn()
          .mockReturnValue({
            lean: () => ({
              _id: "m111",
              senderId: { _id: "123", name: "Rahul" },
            }),
          }),
      });

      Conversation.findOne.mockResolvedValue(null);
      Conversation.create.mockResolvedValue({ messages: [], save: jest.fn() });
      isUserOnline.mockReturnValue(true);

      await sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ result: true })
      );
    });
  });

  // --------------------- DELETE MESSAGE SELF ---------------------- //
  describe("deleteMessage", () => {
    it("should return 200 if message already deleted", async () => {
      const req = { params: { messageId: "m121" }, user: { _id: "123" } };
      const res = mockResponse();

      Messages.findById.mockResolvedValue({ deletedFor: ["123"] });

      await deleteMessage(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Message already deleted",
          result: true,
        })
      );
    });
  });

  // --------------------- DELETE FOR EVERYONE ---------------------- //
  describe("deleteForEveryone", () => {
    it("should return 402 if user not sender", async () => {
      const req = { params: { messageId: "m555" }, user: { _id: "999" } };
      const res = mockResponse();

      Messages.findById.mockResolvedValue({ senderId: "123", deletedFor: [] });

      await deleteForEveryone(req, res);

      expect(res.status).toHaveBeenCalledWith(402);
    });
  });

  // --------------------- CLEAR CHAT ---------------------- //
  describe("clearChat", () => {
    it("should return 404 if conversation not found", async () => {
      const req = { params: { friendId: "300" }, user: { _id: "200" } };
      const res = mockResponse();

      Conversation.findOne.mockResolvedValue(null);

      await clearChat(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // --------------------- MARK AS READ ---------------------- //
  describe("markAsRead", () => {
    it("should update message read status", async () => {
      Messages.findByIdAndUpdate.mockResolvedValue({
        _id: "m1",
        readReceipts: "read",
      });

      await markAsRead("m1");

      expect(Messages.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  // --------------------- DELETE MEDIA ---------------------- //
  describe("deleteMedia", () => {
    it("should return 400 if no mediaUrl sent", async () => {
      const req = { body: { mediaUrl: "" }, params: { id: "m1" } };
      const res = mockResponse();

      await deleteMedia(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
