import { StartServer } from "./server"
import { connectDB } from "./db"
import "./cloudinary"
import "./brevo"

const connectApp = () => {
    connectDB()
    StartServer()
}


export default connectApp

