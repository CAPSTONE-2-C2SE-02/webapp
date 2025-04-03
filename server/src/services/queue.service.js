import amqp from "amqplib";

export const sendToQueue = async (queue, message) => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(queue, { durable: true });

        await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });

        console.log("📩 [Sent] Message to queue:", message);

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error("❌ Error sending message to queue:", error);
    }
};
