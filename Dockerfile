FROM python:3.12-slim
WORKDIR /app
COPY bot.py .
RUN pip install python-telegram-bot==20.8 requests
VOLUME /app/data
ENV DB_FILE=/app/data/harvest.db
CMD ["python", "bot.py"]