# Fetch Rewards Assessment

## Installation

1. Clone this repository.
1. `cd` into the newly created directory.
1. Run `npm install`.
1. Run `npm run dev`. This command will spin up a server on port 5000 that will automatically restart when changes are made to source.

## API Paths

| API path        | Function                                                                        |
| --------------- | ------------------------------------------------------------------------------- |
| `/transactions` | GET: List all transactions POST: Create a new transaction                       |
| `/spend`        | POST: Create new spending transactions, returns list of payers and points spent |
| `/balances`     | GET: List all payer balances                                                    |
