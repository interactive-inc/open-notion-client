.PHONY: deploy check

update-packages:
	vp update
	vp install

deploy:
	vp fmt
	vp lint
	vp test
	vp run check
	vp run build
	vp pm publish

check:
	vp fmt
	vp lint
	vp test
	vp run check
