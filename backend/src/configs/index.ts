import { StartServer } from "./server"
import { connectDB } from "./db"
import "./cloudinary"

const connectApp = () => {
    connectDB()
    StartServer()
}


export default connectApp


