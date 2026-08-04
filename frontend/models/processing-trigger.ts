/**
 * This module provides a way to trigger document processing.
 * In a real-world application, this would likely involve pushing a message
 * to a message queue (e.g., Redis, RabbitMQ, SQS) which a separate worker
 * process would consume and handle.
 *
 * For this implementation, we'll simulate a background job by making an
 * internal API call. This is synchronous but demonstrates the intent.
 */

export async function triggerDocumentProcessing(documentId: string): Promise<void> {
  try {
    // Simulate an asynchronous background job by making an internal API call.
    // In a production system, this would be a non-blocking message queue push.
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/documents/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId }),
    });
    if (!response.ok) {
      console.error(`Failed to trigger document processing for ${documentId}:`, await response.text());
    }
  } catch (error) {
    console.error(`Error triggering document processing for ${documentId}:`, error);
  }
}