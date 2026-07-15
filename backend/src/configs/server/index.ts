import express, { Application } from "express"
import cors from "cors"
import authRoutes from "../../routes/authRoutes"
import employeeRoutes from "../../routes/employeeRoutes"
import managerRoutes from "../../routes/managerRoutes"
import profileRoutes from "../../routes/profileRoutes"
import projectRoutes from "../../routes/projectRoutes"
import taskRoutes from "../../routes/taskRoutes"
import notificationRoutes from "../../routes/notificationRoutes"
import uploadRoutes from "../../routes/uploadRoutes"
import { controllerHandler } from "../../utils/ControllerHandler"

const app: Application = express()

app.use(cors())
app.use(express.json())

app.get("/", (_req, res) => {
    controllerHandler.jsonResponse(res, { message: "Welcome to TTM APIs", status: "ok" })
})

app.use("/api/auth", authRoutes)
app.use("/api/employees", employeeRoutes)
app.use("/api/managers", managerRoutes)
app.use("/api/profile", profileRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/upload", uploadRoutes)

const StartServer = () => {
    let port = process.env.PORT || 5000;
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    })
}


export { StartServer }
