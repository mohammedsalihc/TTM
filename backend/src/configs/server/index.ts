import express, { Application } from "express"
import authRoutes from "../../routes/authRoutes"

const app: Application = express()

app.use(express.json())
app.use("/api/auth", authRoutes)

const StartServer = () => {
    let port = process.env.PORT || 5000;
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    })
}


export { StartServer }
