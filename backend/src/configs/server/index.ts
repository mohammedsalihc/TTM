import express , {Application} from "express"
const app:Application = express()

const StartServer = () => {
    let port = process.env.PORT || 5000;
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    })
}


export {StartServer}