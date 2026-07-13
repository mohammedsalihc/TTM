import { StartServer } from "./server"
import { connectDB } from "./db"

const connectApp = () => {
    connectDB()
    StartServer()
}


export default connectApp


