const express = require('express')
const Order = require('./order')

const app = express()
app.use(express.json())
function init() {
    var orderList = new Array(
        new Order('1', 'Mobile', 'electronics', 'white', 20000),
        new Order('2', 'T-Shirt', 'clothes', 'black', 999),
        new Order('3', 'Jeans', 'clothes', 'blue', 1999),
        new Order('4', 'Laptop', 'electronics', 'gray', 50000),
        new Order('5', 'Digital watch', 'electronics', 'black', 2500),
    )
    return orderList
}
let orderList = init()

app.get('/orders', (req, res) => {
    let orders = []
    let category = req.query.category
    if (req.query.category) {
        orders = orderList.filter((item) => item.category === category)
    } else {
        orders = orderList
    }
    res.status(200).send(orders)
})

app.listen(3002, () => console.log('Service B running on port 3002'))