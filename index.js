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
        const articles = await prisma.article.findMany();
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

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});