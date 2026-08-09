.PHONY: deploy check

update-packages:
	bunx npm-check-updates -u
	vp install

deploy:
	vp fmt --write
	vp lint
	vp test
	vp run check
	vp run build
	npm publish

check:
	vp fmt
	vp lint
	vp test
	vp run check
