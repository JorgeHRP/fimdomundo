# Plano B no EasyPanel (Build: Dockerfile). Python travado na 3.12.
FROM python:3.12.8-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=8000
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd -r -u 10001 site && mkdir -p /data && chown site /data
USER site
EXPOSE 8000
CMD ["python", "servidor.py"]
