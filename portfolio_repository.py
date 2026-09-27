from app.database.connection import con_db
 
class PortfolioRepository:
    def create_portfolio(
        self,
        portfolio_name,
        portfolio_type,
        currency,
        exchange,
        theme_id,
        benchmark_id,
        initial_investment,
        rebalancing_frequency
    ):
        conn = con_db.get_db_connection()
 
        try:
            cursor = conn.cursor()
 
            cursor.execute(
                """
                INSERT INTO portfolio (
                    portfolio_name,
                    portfolio_type,
                    currency,
                    exchange,
                    theme_id,
                    benchmark_id,
                    initial_investment,
                    available_balance,
                    rebalancing_frequency,
                    status
                )
                VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s
                )
                RETURNING portfolio_id;
                """,
                (
                    portfolio_name,
                    portfolio_type,
                    currency,
                    exchange,
                    theme_id,
                    benchmark_id,
                    initial_investment,
 
                    # At creation no money is invested yet.
                    # So full investment is available.
                    initial_investment,
 
                    rebalancing_frequency,
                    "New"
                )
            )
 
            portfolio_id = cursor.fetchone()[0]
 
            conn.commit()
 
            return portfolio_id
 
        except Exception:
            conn.rollback()
            raise
 
        finally:
            conn.close()
 
 
    def get_all_portfolios(self):
        conn = con_db.get_db_connection()
 
        try:
            cursor = conn.cursor()
 
            cursor.execute(
                """
                SELECT
                    p.portfolio_id,
                    p.portfolio_name,
                    p.portfolio_type,
                    p.currency,
                    p.exchange,
                    p.initial_investment,
                    p.available_balance,
                    p.rebalancing_frequency,
                    p.status,
                    it.theme_name,
                    bm.benchmark_name,
                    p.created_date,
                    p.go_live_date,
                    p.closed_date
 
                FROM portfolio p
 
                JOIN investment_theme it
                    ON p.theme_id = it.theme_id
 
                JOIN benchmark_master bm
                    ON p.benchmark_id = bm.benchmark_id
 
                ORDER BY p.portfolio_id;
                """
            )
 
            rows = cursor.fetchall()
            portfolios = []
            for row in rows:
                portfolio = {
                    "portfolio_id": row[0],
                    "portfolio_name": row[1],
                    "portfolio_type": row[2],
                    "currency": row[3],
                    "exchange": row[4],
                    "initial_investment": row[5],
                    "available_balance": row[6],
                    "rebalancing_frequency": row[7],
                    "status": row[8],
                    "theme_name": row[9],
                    "benchmark_name": row[10],
                    "created_date": row[11],
                    "go_live_date": row[12],
                    "closed_date": row[13]
                }
                portfolios.append(portfolio)
            return portfolios
        
        finally:
            conn.close()
 
 
    def get_portfolio_by_id(self, portfolio_id):
        conn = con_db.get_db_connection()
 
        try:
            cursor = conn.cursor()
 
            cursor.execute(
                """
                SELECT
                    p.portfolio_id,
                    p.portfolio_name,
                    p.portfolio_type,
                    p.currency,
                    p.exchange,
                    p.theme_id,
                    it.theme_name,
                    p.benchmark_id,
                    bm.benchmark_name,
                    p.initial_investment,
                    p.available_balance,
                    p.rebalancing_frequency,
                    p.status,
                    p.created_date,
                    p.go_live_date,
                    p.closed_date
 
                FROM portfolio p
 
                JOIN investment_theme it
                    ON p.theme_id = it.theme_id
 
                JOIN benchmark_master bm
                    ON p.benchmark_id = bm.benchmark_id
 
                WHERE p.portfolio_id = %s;
                """,
                (portfolio_id,)
            )
 
            row = cursor.fetchone()
            if row is None:
                return None

            return{
                "portfolio_id": row[0],
                "portfolio_name": row[1],
                "portfolio_type": row[2],
                "currency": row[3],
                "exchange": row[4],
                "theme_id": row[5],
                "theme_name": row[6],
                "benchmark_id": row[7],
                "benchmark_name": row[8],
                "initial_investment": row[9],
                "available_balance": row[10],
                "rebalancing_frequency": row[11],
                "status": row[12],
                "created_date": row[13],
                "go_live_date": row[14],
                "closed_date": row[15]
            }
        finally:
            conn.close()
 
    """def get_portfolio_by_id(self, portfolio_id: int):
        conn = con_db.get_db_connection()
    
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    SELECT
                        portfolio_id,
                        portfolio_name,
                        status,
                        go_live_date,
                        closed_date
                    FROM portfolio
                    WHERE portfolio_id = %
                    (portfolio_id,)
                )
    
                row = cursor.fetchone()
                if row is None:
                    return None

                return{
                    "portfolio_id": row[0],
                    "portfolio_name": row[1],
                    "status": row[2],
                    "go_live_date": row[3],
                    "closed_date": row[4]
                }
    
        finally:
            conn.close()
    """
    
    def activate_portfolio(self, portfolio_id: int):
        conn = con_db.get_db_connection()
    
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE portfolio
                    SET status = 'Active',
                        go_live_date = CURRENT_DATE,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE portfolio_id = %s
                    """,
                    (portfolio_id,)
                )
    
            conn.commit()
    
        except Exception:
            conn.rollback()
            raise
    
        finally:
            conn.close()
    
    
    def close_portfolio(self, portfolio_id: int):
        conn = con_db.get_db_connection()
    
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE portfolio
                    SET status = 'Closed',
                        closed_date = CURRENT_DATE,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE portfolio_id = %s
                    """,
                    (portfolio_id,)
                )
    
            conn.commit()
    
        except Exception:
            conn.rollback()
            raise
    
        finally:
            conn.close()

    def get_portfolio_performance(self, portfolio_id: int):
        conn = con_db.get_db_connection()
    
        try:
            with conn.cursor() as cursor:
    
                cursor.execute(
                    """
                    SELECT
                        portfolio_id,
                        portfolio_name,
                        benchmark_id,
                        benchmark_name,
                        initial_investment,
                        holdings_invested_value,
                        holdings_current_value,
                        available_balance,
                        total_portfolio_value,
                        profit_loss,
                        portfolio_return_percentage
    
                    FROM vw_portfolio_performance
    
                    WHERE portfolio_id = %s
                    """,
                    (portfolio_id,)
                )
    
                return cursor.fetchone()
    
        finally:
            conn.close()

portfolio_repository = PortfolioRepository()