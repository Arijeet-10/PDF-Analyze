# Backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

EXPOSE 7860

# Command to run the Uvicorn server
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]