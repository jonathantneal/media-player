# Contributing to Media Player

You want to help? You rock! But please, take a moment to be sure your
contributions make sense to everyone else.

## Reporting Issues

Found a problem? Want a new feature?

- Please, see if your issue or idea has [already been reported].
- Please, provide a [reduced test case] or a [live example].

Remember, a bug is a _demonstrable problem_ caused by _our_ code.

## Submitting Pull Requests

Pull requests are the greatest contributions, so be sure they are focused in
scope and avoid unrelated commits.

1. To begin; [fork this project] and then clone your fork locally
   ```bash
   # Clone your fork of this project
   git clone git@github.com:YOUR_USER/media-player.git

   # Navigate to your fork of this project
   cd media-player

   # Install the tools necessary for testing this project
   npm install

   # Assign the original repo to a remote called "upstream"
   git remote add upstream git@github.com:jonathantneal/media-player.git

   # Clone your fork of the gh-pages branch / directory
   git clone --branch gh-pages git@github.com:YOUR_USER/media-player.git gh-pages

   # Navigate to your fork of the gh-pages branch
   cd gh-pages

   # Assign the original branch to a remote called "upstream"
   git remote add upstream git@github.com:jonathantneal/media-player.git
   ```

2. Create a branch for your feature or fix:
   ```bash
   # Move into a new branch for your feature
   git checkout -b feature/thing
   ```
   ```bash
   # Move into a new branch for your fix
   git checkout -b fix/something
   ```

3. If your code follows our practices, then push your feature branch:
   ```bash
   # Test current code
   npm test
   ```
   ```bash
   # Push the branch for your new feature
   git push origin feature/thing
   ```
   ```bash
   # Or, push the branch for your update
   git push origin update/something
   ```

That’s it! Now [open a pull request] with a clear title and description.

[already been reported]: https://github.com/jonathantneal/media-player/issues
[fork this project]:     https://github.com/jonathantneal/media-player/fork
[live example]:          https://codepen.io/pen
[open a pull request]:   https://help.github.com/articles/using-pull-requests/
[reduced test case]:     https://css-tricks.com/reduced-test-cases/
