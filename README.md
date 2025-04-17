# Financial Dashboard Backend

This is the backend part of the Financial Dashboard application built with Node.js, Express, and WebSocket.

## Features

- Real-time stock price updates via WebSocket
- RESTful API for fetching stock data
- Environment variable management with dotenv

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node package manager)
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd financial-dashboard-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Add your environment variables in a `.env` file:
   ```plaintext
   PORT=4000
   FINNHUB_API_KEY=your_api_key
   ```

### Running the Application

To start the server, run:
```bash
npm run dev
```

### Running with Docker

1. Build the Docker image:
   ```bash
   docker build -t financial-dashboard-backend .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 4000:4000 financial-dashboard-backend
   ```

### Running with Docker Compose

Docker Compose allows you to run both the frontend and backend services together with a single command. This is useful for development and testing purposes.

#### Prerequisites

- Docker
- Docker Compose

#### Steps

1. Ensure your `docker-compose.yml` is correctly configured. It should be located in the root directory of your project.

2. Open a terminal and navigate to the directory containing the `docker-compose.yml` file.

3. Run the following command to build and start the services:
   ```bash
   docker-compose up --build
   ```

4. To stop the services, press `Ctrl+C` in the terminal or run:
   ```bash
   docker-compose down
   ```

This setup will automatically build the Docker images for both the frontend and backend, and start the services as defined in the `docker-compose.yml` file.

### Testing

To run tests, use:
```bash
npm test
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.