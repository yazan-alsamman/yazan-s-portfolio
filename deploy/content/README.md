# One-time content package (first deployment only)

`portfolio-content.tar.enc` holds the owner's portfolio content for the first VPS deployment:
the PostgreSQL dump, the media archive and their SHA-256 checksums. It is encrypted
(AES-256-CBC, PBKDF2-SHA256, 600,000 iterations); the password is not in this repository.

Decrypt on the VPS (the password is typed, never stored in shell history):

```sh
read -rsp 'Content password: ' P && printf '%s' "$P" > ~/.content-pass && chmod 600 ~/.content-pass && unset P
mkdir -p ~/transfer && chmod 700 ~/transfer
openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 -pass file:"$HOME/.content-pass" \
  -in deploy/content/portfolio-content.tar.enc | tar -xf - -C ~/transfer
(cd ~/transfer && sha256sum -c SHA256SUMS)
```

Then follow `docs/deployment/RUNBOOK.md` §4 (restore before the first build). After the deployment
is verified, delete `~/transfer` and `~/.content-pass`, and remove this package from the repository.
