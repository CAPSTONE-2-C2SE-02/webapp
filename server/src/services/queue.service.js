import amqp from "amqplib";

async function sendToQueue(queue, msg) {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)), { persistent: true });
    console.log(`📩 [x] Sent ${queue}:`, msg);
    setTimeout(() => connection.close(), 500);
}

export { sendToQueue };
