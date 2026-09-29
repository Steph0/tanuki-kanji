# Tanuki Kanji

## Key Features

<TODO>

## Development & Technical Guidelines

For complete details on the architecture, tech stack, security constraints, and coding guidelines, please refer to [AGENTS.md](./AGENTS.md).

### Dev server

#### Remote access

By default this project is configured to not allow remote access.
However you can easily expose a local IP and DNS using this method :

- Create a `.env.development` file in your repository (will be ignored by default) and two variables
  - `VITE_ALLOWED_HOST_REMOTE_IP=a.b.c.d`
  - `VITE_ALLOWED_HOST_REMOTE_DNS=your.dns`
- then run the server using `npm run dev -- --host`

This will limit your dev server exposure to those entrypoints.

### Testing

<TODO>

## License

Please refer to the [LICENSE](./LICENSE) file for usage and distribution terms.
