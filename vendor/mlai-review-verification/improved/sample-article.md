# Start with the source.

Prepare an ABI checkout and follow its own validation workflow.

## Prepare your checkout

Begin with the current ABI README and its toolchain and sibling-workspace prerequisites. The project uses nightly Rust and a checked-in Cargo wrapper. Do not treat a copied command as proof that every dependency is present on your machine.

Clone the public repository into your own development workspace, then finish the upstream setup instructions before building. This website does not execute these commands or provision a runtime.

```sh
git clone https://github.com/donaldfilimon/abi.git
cd abi
```

> The repository may require additional sibling-workspace setup. Follow its current README before running the gate.

## Use the project’s validation gate

The README identifies tools/check.sh as the primary validation gate and tools/cargo.sh as the wrapper for nightly Cargo. Use the wrapper rather than assuming bare cargo selects the intended toolchain.

A successful gate is evidence for that checkout and environment. Record the commit, toolchain and actual output when you share results. The commands below come from documentation; they were not executed as part of this website build.

```sh
./tools/cargo.sh --version
./tools/check.sh
./tools/cargo.sh build -p abi-cli
```

## Inspect local behavior

Once the CLI has built, the README provides local inspection entry points. Start with backend and scheduler information before enabling an external provider. Check what your process actually reports instead of inferring capabilities from a product label.

Live transports require their own configuration and explicit authorization. This guide does not ask for credentials, activate a cloud backend, or turn a local demonstration into a production service.

```sh
./target/debug/abi backends
./target/debug/abi scheduler status
```

## Follow the source

- [ABI README](https://github.com/donaldfilimon/abi/blob/main/README.md) — Source description, tool commands and stated limitations; not a reproduced test run.

---
Exported from the independent MLAI review. Source descriptions are not independently reproduced test results.
