.PHONY: start
start:
	yarn install
	yarn tsc
	yarn build:backend
	yarn build-image
	docker-compose up

