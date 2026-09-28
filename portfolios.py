from fastapi import (
    APIRouter,
    HTTPException
)

from app.schemas import (
    PortfolioCreate,
    BuyRequest,
    SellRequest
)

from app.services.portfolio_service import (
    portfolio_service
)

from app.services.transaction_service import (
    transaction_service
)

from app.services.allocation_service import (
    allocation_service
)

from app.services.alert_service import (
    alert_service
)

from app.services.rebalancing_service import (
    rebalancing_service
)

from app.services.performance_service import (
    performance_service
)


router = APIRouter(
    prefix="/api/portfolios",
    tags=["Portfolios"]
)


# =========================================================
# CREATE PORTFOLIO
# =========================================================

@router.post("")
def create_portfolio(
    data: PortfolioCreate
):

    try:

        return (
            portfolio_service
            .create_portfolio(
                data
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# =========================================================
# GET ALL PORTFOLIOS
# =========================================================

@router.get("")
def get_all_portfolios():

    return (
        portfolio_service
        .get_all_portfolios()
    )


# =========================================================
# ACTIVATE PORTFOLIO
# =========================================================

@router.put(
    "/{portfolio_id}/activate"
)
def activate_portfolio(
    portfolio_id: int
):

    try:

        return (
            portfolio_service
            .activate_portfolio(
                portfolio_id
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# =========================================================
# BUY SECURITY
# =========================================================

@router.post(
    "/{portfolio_id}/buy"
)
def buy_security(
    portfolio_id: int,
    data: BuyRequest
):

    try:

        return (
            transaction_service
            .buy(
                portfolio_id,
                data
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# =========================================================
# SELL SECURITY
# =========================================================

@router.post(
    "/{portfolio_id}/sell"
)
def sell_security(
    portfolio_id: int,
    data: SellRequest
):

    try:

        return (
            transaction_service
            .sell(
                portfolio_id,
                data
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# =========================================================
# PORTFOLIO HOLDINGS
# =========================================================

@router.get(
    "/{portfolio_id}/holdings"
)
def get_holdings(
    portfolio_id: int
):

    try:

        return (
            transaction_service
            .get_holdings(
                portfolio_id
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


# =========================================================
# PORTFOLIO TRANSACTIONS
# =========================================================

@router.get(
    "/{portfolio_id}/transactions"
)
def get_transactions(
    portfolio_id: int
):

    try:

        return (
            transaction_service
            .get_transactions(
                portfolio_id
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


# =========================================================
# PORTFOLIO ASSET ALLOCATION
# =========================================================

@router.get(
    "/{portfolio_id}/allocation"
)
def get_portfolio_allocation(
    portfolio_id: int
):

    try:

        return (
            allocation_service
            .get_allocation(
                portfolio_id
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# =========================================================
# RECALCULATE ALERTS
#
# Mainly useful for Swagger/testing.
# BUY and SELL already recalculate automatically.
# =========================================================

@router.post(
    "/{portfolio_id}/recalculate-alerts"
)
def recalculate_alerts(
    portfolio_id: int
):

    try:

        return (
            alert_service
            .recalculate_alerts(
                portfolio_id
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# =========================================================
# PORTFOLIO ALERTS
# =========================================================

@router.get(
    "/{portfolio_id}/alerts"
)
def get_portfolio_alerts(
    portfolio_id: int
):

    try:

        return (
            alert_service
            .get_portfolio_alerts(
                portfolio_id
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# =========================================================
# REBALANCING
# =========================================================

@router.get(
    "/{portfolio_id}/rebalancing"
)
def get_rebalancing(
    portfolio_id: int
):

    try:

        return (
            rebalancing_service
            .get_rebalancing(
                portfolio_id
            )
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )
# =========================================================
# PORTFOLIO PERFORMANCE
# =========================================================

@router.get(
    "/{portfolio_id}/performance"
)
def get_portfolio_performance(
    portfolio_id: int
):

    try:

        return (
            performance_service
            .get_performance(
                portfolio_id
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# =========================================================
# GET ONE PORTFOLIO
#
# Keeping this at the bottom makes the specific routes
# above easier to read and maintain.
# =========================================================

@router.get(
    "/{portfolio_id}"
)
def get_portfolio(
    portfolio_id: int
):

    try:

        return (
            portfolio_service
            .get_portfolio(
                portfolio_id
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )
    