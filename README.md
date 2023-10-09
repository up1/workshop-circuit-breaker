# Demo circuit breaker
* Services with NodeJS
  * [Mollitia](https://genesys.github.io/mollitia/) :: JavaScript Resilience library
* Appication metric with [Prometheus](https://prometheus.io/)
* Alert system with [Alarm Manager](https://prometheus.io/docs/alerting/latest/alertmanager/)
* Dashboard with [Grafana](https://grafana.com/)

## Run with Docker compose

## Step 1 :: Build image of services
```
$docker compose build service_a
$docker compose build service_b
```

## Step 2 :: Start services
```
$docker compose up -d service_a
$docker compose up -d service_b

$docker compose ps
NAME                IMAGE               COMMAND                  SERVICE             CREATED             STATUS              PORTS
cb-service_a-1      cb-service_a        "docker-entrypoint.s…"   service_a           7 seconds ago       Up 7 seconds        0.0.0.0:3001->3001/tcp
cb-service_b-1      cb-service_b        "docker-entrypoint.s…"   service_b           2 seconds ago       Up 2 seconds        0.0.0.0:3002->3002/tcp
```

## Step 3 :: Call API
```
$curl http://localhost:3001/orders?category=
$curl http://localhost:3002/orders?category=
```

Call Metric of Circuit breaker
* http://localhost:3001/metrics

List of metric names
* total_failures


Try to load tests
```
$wrk -c 100 -t 5 -d 10s http://localhost:3001/orders?category=
```


## Step 4 :: Start Prometheus and Alert Manager
```
$docker compose build alertmanager
$docker compose up -d alertmanager

$docker compose build prometheus
$docker compose up -d prometheus

$docker compose ps
NAME                IMAGE                       COMMAND                  SERVICE             CREATED              STATUS              PORTS
cb-alertmanager-1   prom/alertmanager:v0.25.0   "/bin/alertmanager -…"   alertmanager        About a minute ago   Up About a minute   0.0.0.0:9093->9093/tcp
cb-prometheus-1     prom/prometheus             "/bin/prometheus --c…"   prometheus          20 seconds ago       Up 4 seconds        0.0.0.0:9090->9090/tcp
cb-service_a-1      cb-service_a                "docker-entrypoint.s…"   service_a           23 minutes ago       Up 23 minutes       0.0.0.0:3001->3001/tcp
cb-service_b-1      cb-service_b                "docker-entrypoint.s…"   service_b           23 minutes ago       Up 23 minutes       0.0.0.0:3002->3002/tcp
```

Access to prometheus server
* http://localhost:9090
  * Go to menu Status => Targets
  * Go to menu Status => Rules
  * Alerts

