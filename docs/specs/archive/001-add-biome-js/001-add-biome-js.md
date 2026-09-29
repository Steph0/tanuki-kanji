# Why

Currently there are no linter and formatter in project.

# What

Add Biome js for linting and formatting.

# Constraints

- No CI/CD setup.
- No custom biome.json.
- No hook commits.
- Use default Biome settings.
- READ-ONLY Phase: No file edits, modifications, or system changes are permitted.

# Tasks

- [X] Install Biome as a development dependency:
    npm install -D @biomejs/biome

    Check Installation: Verify that the package is installed by checking your package.json file to ensure @biomejs/biome is listed under devDependencies.

- [X] Initialize Biome to set up the default configuration:
    npx @biomejs/biome init

    Check Configuration: Verify that the initialization command successfully created a configuration file (e.g., biome.json) in the root of your project directory.

    Check Functionality: Run the Biome command directly to see if it executes without errors:
    npx @biomejs/biome check
    This command will check your code against the default rules. It is OK that rules are not respected as long as it shows biome runs correctly.

- [X] Add package.json to existing scripts, only append do not replace entirely

    ```json
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    ```
