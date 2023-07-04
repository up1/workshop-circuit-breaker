# Demo circuit breaker with NodeJS
* [Express](https://expressjs.com/)
* [Axios](https://github.com/axios/axios)
* [Mollitia](https://genesys.github.io/mollitia/)
* [Prometheus](https://prometheus.io/)
* [Alert manager](https://prometheus.io/docs/alerting/latest/alertmanager/)
* [Grafana](https://grafana.com/)

## Build
```
$npm install
```

## Start service A with port = 3001
```
$npm run start_service_a
```

## Start service B with port = 3002
```
$npm run start_service_b
```

## Call API
```
$curl http://localhost:3001/orders?category=
$curl http://localhost:3002/orders?category=
```

## Call Metric of Circuit breaker
* http://localhost:3001/metrics


