# Build a static binary, ship it on distroless.
FROM golang:1.27 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/directino ./cmd/directino

FROM gcr.io/distroless/static-debian12
COPY --from=build /out/directino /directino
USER nonroot
EXPOSE 8080
ENTRYPOINT ["/directino"]
