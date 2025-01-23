import { app } from "./index";
import { connectDB, disconnectDB } from "./db";
import { Server } from 'http';

const port = process.env.PORT || 3000;
let server: Server; // Change the type to Server instead of Express.Application

async function startServer() {
    try {
        // Connect to the database
        await connectDB();
        // Start the server
        server = app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to start the server:", error);
        process.exit(1);
    }
}

function gracefulShutdown(signal: string) {
    console.log(`Received ${signal}. Initiating graceful shutdown...`);

    // Close the server
    if (server) {
        server.close(async () => {
            console.log("HTTP server closed.");
            
            // Disconnect from the database
            try {
                await disconnectDB();
            } catch (error) {
                console.error("Error closing database connection:", error);
            } finally {
                process.exit(0);
            }
        });
    } else {
        process.exit(0);
    }
}

// Register signal handlers for graceful shutdown
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Start the server
startServer();
