FROM golang:1.25.1 AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download


COPY . .


RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/server


FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/main .


EXPOSE 1001


CMD ["./main"]