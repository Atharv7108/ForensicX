# FastAPI Hello World

This is a simple FastAPI project that demonstrates a basic "Hello, World!" application.

## Project Structure

```
fastapi-hello-world
├── app
│   ├── main.py
│   └── __init__.py
├── requirements.txt
└── README.md
```

## Requirements

To run this project, you need to have Python installed. You can install the required dependencies using the following command:

```
pip install -r requirements.txt
```

## Running the Application

To run the FastAPI application, use the following command:

```
uvicorn app.main:app --reload
```

After running the command, you can access the application at `http://127.0.0.1:8000`. You should see "Hello, World!" when you visit the root endpoint.

## API Documentation

FastAPI automatically generates documentation for your API. You can access it at:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## License

This project is licensed under the MIT License.