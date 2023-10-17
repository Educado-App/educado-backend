const request = require("supertest");
const express = require("express");
const mongoose = require('mongoose');

const schema = require('../../routes/credentialsRoutes'); // Import your router file here
const connectDb = require('../fixtures/db');
const { ContentCreatorApplication } = require("../../models/ContentCreatorApplication");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { compare, encrypt } = require("../../helpers/password");

const Model = mongoose.model('Test', schema);

const app = express();
app.use(express.json());
app.use('/api/auth', schema); // Mount the router under '/api' path

// Start the Express app on a specific port for testing
const PORT = 5020; // Choose a port for testing
const server = app.listen(PORT);

let db; // Store the database connection
beforeAll(async () => {
  db = await connectDb(); // Connect to the database
});

describe("Credentials Routes", () => {
    describe("POST /signup", () => {
        it("should create a new content creator application", async () => {
            const response = await request(app)
                .post("/signup")
                .send({
                    email: "test@example.com",
                    password: "password",
                    name: "John Doe",
                    /* this should be addded in a future sprint, so im gonna leave it commented out for now
                    firstName: "John",
                    lastName: "Doe",
                    motivation: "I am a content creator",
                    */
                })
                .expect(201);

            const contentCreatorApplication = await ContentCreatorApplication.findOne({
                email: "test@example.com",
            });
            expect(contentCreatorApplication).not.toBeNull();

            // Check if password is encrypted
            expect(contentCreatorApplication.password).not.toBe("password");
            const isPasswordMatch = await bcrypt.compare("password",
                contentCreatorApplication.password
            );
            expect(isPasswordMatch).toBe(true);

            // Check if JWT token is returned
            const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
            expect(decoded.email).toBe("test@example.com");
        });
    });

    describe("POST /login", () => {
        it("should log in a content creator", async () => {
            const password = "password";
            const hashedPassword = await bcrypt.hash(password, 10);
            const contentCreatorApplication = Mode1.ContentCreatorApplication({
                email: "test@example.com",
                password: hashedPassword,
                name: "John Doe",
                /* this should be addded in a future sprint, so im gonna leave it commented out for now
                firstName: "John",
                lastName: "Doe",
                */
            });
            await contentCreatorApplication.save();

            const response = await request(app)
                .post("/login")
                .send({
                    email: "test@example.com",
                    password: "password",
                })
                .expect(200);

            // Check if JWT token is returned
            const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
            expect(decoded.email).toBe("test@example.com");
        });

        it("should not log in a content creator with incorrect password", async () => {
            const password = "password";
            const hashedPassword = await bcrypt.hash(password, 10);
            const contentCreatorApplication = Mode1.ContentCreatorApplication({
                email: "test@example.com",
                password: hashedPassword,
                name: "John Doe",
                /* this should be addded in a future sprint, so im gonna leave it commented out for now
                firstName: "John",
                lastName: "Doe",
                */
            });
            await contentCreatorApplication.save();

            await request(app)
                .post("/login")
                .send({
                    email: "test@example.com",
                    password: "wrongpassword",
                })
                .expect(400);
        });

        it("should not log in a content creator with incorrect email", async () => {
            const password = "password";
            const hashedPassword = await bcrypt.hash(password, 10);
            const contentCreatorApplication = Mode1.ContentCreatorApplication({
                email: "test@example.com",
                password: hashedPassword,
                name: "John Doe",
                /* this should be addded in a future sprint, so im gonna leave it commented out for now
                firstName: "John",
                lastName: "Doe",
                */
            });
            await contentCreatorApplication.save();

            await request(app)
                .post("/login")
                .send({
                    email: "wrongemail@example.com",
                    password: "password",
                })
                .expect(400);
        });
    });
});

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
});
