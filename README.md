# DHIS2 Advanced Metadata Export App

Allows to create packages of metadata with their own dependencies.

## Development set-up

- Create .env file with the following content

```
REACT_APP_DEBUG=true
REACT_APP_DHIS2_BASE_URL=http://who-dev.essi.upc.edu:8081/api
REACT_APP_DHIS2_USERNAME=username
REACT_APP_DHIS2_PASSWORD=password
```

- Launch Chrome with CORS disabled

- Execute development server

```
npm run start
```

## Build a release package

- Create a packaged zip

```
npm run build
```