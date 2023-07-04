const express = require('express')
const axios = require('axios')

const MollitiaPrometheus = require('@mollitia/prometheus')
const Mollitia = require('mollitia')

const app = express()
const { Circuit, Fallback, SlidingCountBreaker, BreakerState } = Mollitia

app.use(express.json())
Mollitia.use(new MollitiaPrometheus.PrometheusAddon())

const config = {
    name: 'appCounter',
    slidingWindowSize: 6, // Failure Rate Calculation is done on the last 6 iterations
    minimumNumberOfCalls: 3, // 3 iterations are needed to start calculating the failure rate, and see if circuit should be opened or not
    failureRateThreshold: 60, // If half of the iterations or more are failing, the circuit is switched to Opened state.
    slowCallDurationThreshold: 500, // An iteration is considered as being slow if the iteration lasts more than 1s
    slowCallRateThreshold: 50, // If at least 80% of the iterations are considered as being slow, the circuit is switched to Opened state.
    permittedNumberOfCallsInHalfOpenState: 2, // When the circuit is in Half Opened state, the circuit accepts 2 iterations in this state.
    openStateDelay: 10000, // The circuit stays in Opened state for 10s
    halfOpenStateMaxDelay: 30000,
}


const slidingCountBreaker = new SlidingCountBreaker(config)

const fallback = new Fallback({
    callback(err) {
        // Every time the method rejects, You can filter here
        if (err) {
            return err.message
        }
    },
})

// Creates a circuit
const serviceBCircuit = new Circuit({
    name: 'Service B Operation',
    options: {
        prometheus: {
            name: 'serviceBCircuit',
        },
        modules: [slidingCountBreaker, fallback],
    },
})

const urlServiceB = process.env.target_url ? process.env.target_url : 'http://localhost:3002'

const orderController = {
    getOrders: (category) => {
        return new Promise((resolve, reject) => {
            axios.get(`${urlServiceB}/orders?category=${category}`)
                .then(result => {
                    if (result.status === 200) {
                        resolve(result.data)
                    } else {
                        resolve(result.data)
                    }
                })
                .catch(err => reject(err))
        });
    }
}

app.get('/metrics', (req, res) => res.send(MollitiaPrometheus.scrap()))

app.get('/orders', (req, res) => {
    serviceBCircuit
        .fn(() => orderController.getOrders(req.query.category))
        .execute()
        .then((result) => {
            console.log('Circuit State -->', slidingCountBreaker.state)
            res.send(result)
        })
        .catch((error) => {
            console.log('Circuit Error State -->', slidingCountBreaker.state)
            if (slidingCountBreaker.state === BreakerState.CLOSED) {
                res.send({
                    status: false,
                    message: "Order service is down",
                })
            } else {
                // Fallback Order response
                res.send([
                    { id: '1', name: 'Fallback Mobile', category: 'electronics', color: 'white', price: 20000 },
                    { id: '4', name: 'Fallback Laptop', category: 'electronics', color: 'gray', price: 50000 },
                ])
            }
        })
})

app.listen(3001, () => {
    console.log('Server A is running on port 3001')
})