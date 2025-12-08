import request from "supertest";
import app from "../../../Server/src/testApp.js"; // your Express entry file
import { connectMemoryDB, disconnectMemoryDB, clearDB } from "./setup.js";
import User from "../../../Server/src/models/users.models.js";
import { generateHashPassword } from "../../../Server/src/utils/utils.js";

describe("AUTH Integration Tests", () => {
  beforeAll(async () => {
    await connectMemoryDB();
  });

  afterAll(async () => {
    await disconnectMemoryDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  // REGISTER USER
  it("POST /api/v1/users/register — should register new user", async () => {
    const res = await request(app).post("/api/v1/users/register").send({
      mail: "test@mail.com",
      password: "123456",
      name: "Rahul",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.result).toBe(true);

    const user = await User.findOne({ email: "test@mail.com" });
    expect(user).not.toBeNull();
  });



});
