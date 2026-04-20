.PHONY: verify

verify:
	@echo "== typecheck =="
	@pnpm tsc --noEmit
	@echo "== tests =="
	@pnpm test
	@echo "✓ verify passed"
