import express from "express";
import path from "path";

const app = express();

app.use(express.static(path.join(process.cwd(), 'web')));
app.use("/node_modules", express.static(path.join(process.cwd(), 'node_modules')));
app.use((req, res) => {
	res.sendFile(path.join(process.cwd(), 'web/index.html'));
});

app.listen(8080, () => {
	console.log("Venture server running on port 8080")
});
