import express from "express";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";

const app = express();

app.use(bodyParser.json());

const prisma = new PrismaClient({ log: ["query"] });


app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.post("/articles", async(req, res) => {
    const articles = req.body;

    const data = Array.isArray(articles) ? articles : [articles];

    try {
        const newArticles = await prisma.article.createMany({
            data
        });
        res.status(201).json(newArticles);
    } catch (error) {
        res.status(500).json({ error: "Failed to create article" });
    }
});


app.get("/articles", async(req, res) => {
    try {
        const articles = await prisma.article.findMany({
            include: {
                user: {
                    include: {
                        profile: true
                    }
                }
            }
        });
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch articles" });
    }
});

app.get("/article/:id", async(req, res) => {
    const { id } = req.params;
    try {
        const article = await prisma.article.findUnique({
            where: { id: parseInt(id) }
        });
        if (article) {
            res.status(200).json(article);
        } else {
            res.status(404).json({ error: "Article not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch article" });
    }
});

app.get("/articles/published", async(req, res) => {
    try {
        const articles = await prisma.article.findMany({
            where: { state: "PUBLISHED" }
        });
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch published articles" });
    }
});

app.put("/article/:id", async(req, res) => {
    const article = await prisma.article.update({
        where: { id: parseInt(req.params.id) },
        data: req.body
    });
    res.json(article);
});

app.put("/articles/:ids", async(req, res) => {
    const ids = req.params.ids.split(",").map(id => parseInt(id));
    const updatedArticles = await prisma.article.updateMany({
        where: { id: { in: ids } },
        data: req.body
    });
    res.json(updatedArticles);
});

app.delete("/article/:id", async(req, res) => {
    const { id } = req.params;
    try {
        const article = await prisma.article.delete({
            where: { id: parseInt(id) }
        });
        res.status(200).json(article);
    } catch (error) {
        res.status(500).json({ error: "Failed to delete article" });
    }
});

app.delete("/articles/:ids", async(req, res) => {
    const ids = req.params.ids.split(",").map(id => parseInt(id));
    try {
        const deletedArticles = await prisma.article.deleteMany({
            where: { id: { in: ids } }
        });
        res.status(200).json(deletedArticles);
    } catch (error) {
        res.status(500).json({ error: "Failed to delete articles" });
    }
});

app.post("/users", async(req, res) => {
    const users = req.body;
    const data = Array.isArray(users) ? users : [users];

    try {
        const newUsers = await prisma.user.createMany({
            data
        });
        res.status(201).json(newUsers);
    } catch (error) {
        res.status(500).json({ error: "Failed to create user" });
    }
});

app.get("/users", async(req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

app.get("/user/:id", async(req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: { profile: true }
        });
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

app.post("/user/:id/profile", async(req, res) => {
    const { id } = req.params;
    const profileData = req.body;
    try {
        const profile = await prisma.profile.create({
            data: {
                ...profileData,
                userId: parseInt(id)
            }
        });
        res.status(201).json(profile);
    } catch (error) {
        res.status(500).json({ error: "Failed to create profile" });
    }
});

app.get("/user/:id/profiles", async(req, res) => {
    const { id } = req.params;
    try {
        const profiles = await prisma.profile.findMany({
            where: { userId: parseInt(id) }
        });
        res.status(200).json(profiles);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch profiles" });
    }
});

app.post("/user/:id/articles", async(req, res) => {
    const articles = req.body;
    const data = Array.isArray(articles) ? articles : [articles];

    try {
        const user = await prisma.user.findUniqueOrThrow({ where: { id: parseInt(req.params.id) } });
        const newArticles = await prisma.article.createMany({
            data: data.map(article => ({...article, userId: user.id }))
        });

        res.status(201).json(newArticles);
    } catch (error) {
        res.status(500).json({ error: "Failed to create articles for user" });
    }
});

app.get("/user/:id/articles", async(req, res) => {
    try {
        const user = await prisma.user.findUniqueOrThrow({ where: { id: parseInt(req.params.id) } });
        const articles = await prisma.article.findMany({
            where: { userId: user.id }
        });
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user's articles" });
    }
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});