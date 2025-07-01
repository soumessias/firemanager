# FireManager - Manage your Firestore via a Web UI

FireManager is a web application that provides a user-friendly interface to interact with your Google Cloud Firestore database. It leverages the Firebase Admin SDK to offer powerful management capabilities, including features not readily available in the standard Firebase Console UI. The application features a two-column layout, with all control forms on the left and a dynamic results display on the right, ensuring a streamlined user experience.

## Features

-   **Duplicate Document**: Select an existing document from a chosen collection and duplicate it. You can optionally provide a new document ID for the duplicated record, or let Firestore generate a random one.
-   **Query Documents**: Retrieve documents from a specified collection based on flexible criteria. You can select a field, a dynamic operator (e.g., `==`, `<`, `!=`, `array-contains`), and a value to filter your results. Results are displayed in a clear, tabular format.
-   **Get All Documents in Collection**: Fetch and display all documents present within a selected Firestore collection. Results are presented in a sortable table.
-   **Bulk Delete Documents**: Conditionally delete multiple documents from a collection. You can specify a field, operator, and value to target specific documents for deletion. Deletion by document ID is also supported.
-   **Dynamic Collection and Field Selection**: All relevant operations (Duplicate, Query, Delete) now feature dropdowns that are dynamically populated with your Firestore collection names and, subsequently, with inferred field names based on the selected collection's documents.

## Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/soumessias/firemanager.git
    cd firemanager
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Firebase Service Account Setup:**
    To connect FireManager to your Firestore project, you need a Firebase service account key:
    *   Go to your Firebase project in the Firebase console.
    *   Navigate to **Project settings** (the gear icon) > **Service accounts**.
    *   Click on **Generate new private key**. This will download a JSON file (e.g., `your-project-name-firebase-adminsdk-xxxxx-xxxxxx.json`).
    *   Rename this downloaded file to `credential.json` and place it in the root directory of your `firemanager` project.
    *   **Important**: Add `credential.json` to your `.gitignore` file to prevent it from being committed to version control, as it contains sensitive information.

4.  **Start the server:**

    ```bash
    npm start
    ```

5.  Open your browser and go to `http://localhost:3000`.

## Usage

Upon opening the application, you will see a two-column interface. The left column contains forms for various Firestore operations, and the right column displays the results.

1.  **Select a Collection**: For most operations, start by selecting a collection from the dropdown. This will dynamically populate other relevant dropdowns (like fields or document IDs).
2.  **Fill in Details**: Provide the necessary information for the operation (e.g., document ID for duplication, field/operator/value for queries or deletions).
3.  **Execute**: Click the respective button to perform the operation.
4.  **View Results**: The results of your operation (e.g., queried documents, deletion count, duplicated ID) will appear in the table on the right side of the screen.