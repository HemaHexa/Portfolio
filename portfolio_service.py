from app.repositories.portfolio_repository import portfolio_repository
 
 
class PortfolioService:
 
    def create_portfolio(self, data):
 
        # 1. Validate portfolio type
        allowed_types = ["Weightage", "Amount"]
 
        if data.portfolio_type not in allowed_types:
            raise ValueError(
                "Portfolio type must be Weightage or Amount"
            )
 
        # 2. Validate rebalancing frequency
        allowed_frequencies = [
            "Daily",
            "Monthly",
            "Quarterly",
            "Half-Yearly",
            "Yearly"
        ]
 
        if data.rebalancing_frequency not in allowed_frequencies:
            raise ValueError(
                "Invalid rebalancing frequency"
            )
 
        # 3. Validate investment
        if data.initial_investment <= 0:
            raise ValueError(
                "Initial investment must be greater than 0"
            )
 
        # 4. Create portfolio
        portfolio_id = portfolio_repository.create_portfolio(
            portfolio_name=data.portfolio_name,
            portfolio_type=data.portfolio_type,
            currency=data.currency,
            exchange=data.exchange,
            theme_id=data.theme_id,
            benchmark_id=data.benchmark_id,
            initial_investment=data.initial_investment,
            rebalancing_frequency=data.rebalancing_frequency
        )
 
        return {
            "message": "Portfolio created successfully",
            "portfolio_id": portfolio_id
        }
 
 
    def get_all_portfolios(self):
        return portfolio_repository.get_all_portfolios()
 
 
    def get_portfolio_by_id(self, portfolio_id):
 
        portfolio = portfolio_repository.get_portfolio_by_id(
            portfolio_id
        )
 
        if portfolio is None:
            raise ValueError("Portfolio not found")
 
        return portfolio
 
    def activate_portfolio(self, portfolio_id: int):
 
        portfolio = portfolio_repository.get_portfolio_by_id(
            portfolio_id
        )
    
        if portfolio is None:
            raise ValueError("Portfolio not found")
    
        current_status = portfolio["status"]
    
        if current_status != "New":
            raise ValueError(
                "Only a New portfolio can be activated"
            )
    
        portfolio_repository.activate_portfolio(
            portfolio_id
        )
    
        return {
            "portfolio_id": portfolio_id,
            "portfolio_name": portfolio[1],
            "old_status": current_status,
            "new_status": "Active",
            "message": "Portfolio activated successfully"
        }
    
    
    def close_portfolio(self, portfolio_id: int):
    
        portfolio = portfolio_repository.get_portfolio_by_id(
            portfolio_id
        )
    
        if portfolio is None:
            raise ValueError("Portfolio not found")
    
        current_status = portfolio["status"]
    
        if current_status == "Closed":
            raise ValueError(
                "Portfolio is already closed"
            )
    
        if current_status != "Active":
            raise ValueError(
                "Only an Active portfolio can be closed"
            )
    
        portfolio_repository.close_portfolio(
            portfolio_id
        )
    
        return {
            "portfolio_id": portfolio_id,
            "portfolio_name": portfolio[1],
            "old_status": current_status,
            "new_status": "Closed",
            "message": "Portfolio closed successfully"
        }

    def get_portfolio_performance(self, portfolio_id: int):
 
        row = portfolio_repository.get_portfolio_performance(
            portfolio_id
        )
    
        if row is None:
            raise ValueError("Portfolio not found")
    
        return {
            "portfolio_id": row[0],
            "portfolio_name": row[1],
    
            "benchmark": {
                "benchmark_id": row[2],
                "benchmark_name": row[3]
            },
    
            "initial_investment": float(row[4]),
    
            "holdings_invested_value": float(row[5]),
    
            "holdings_current_value": float(row[6]),
    
            "available_balance": float(row[7]),
    
            "total_portfolio_value": float(row[8]),
    
            "profit_loss": float(row[9]),
    
            "portfolio_return_percentage": round(
                float(row[10]),
                4
            )
        }

portfolio_service = PortfolioService()