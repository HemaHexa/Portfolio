from app.database.connection import get_db_connection
 
 
def create_tables():
 
    conn = get_db_connection()
    cursor = conn.cursor()
 
    try:
 
        # =====================================================
        # 1. ASSET CLASS
        # =====================================================
 
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS asset_class (
 
                asset_class_id SERIAL PRIMARY KEY,
 
                asset_class_name VARCHAR(100) UNIQUE NOT NULL,
 
                asset_description TEXT,
 
                sub_asset_class VARCHAR(100),
 
                sub_asset_description TEXT,
 
                risk_level VARCHAR(50),
 
                investment_horizon VARCHAR(100),
 
                status VARCHAR(20)
                    NOT NULL
                    DEFAULT 'ACTIVE'
                    CHECK (
                        status IN (
                            'ACTIVE',
                            'INACTIVE'
                        )
                    ),
 
                created_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP,
 
                updated_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP
            );
        """)
 
 
        # =====================================================
        # 2. INVESTMENT THEME
        # =====================================================
 
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS investment_theme (
 
                theme_id SERIAL PRIMARY KEY,
 
                theme_name VARCHAR(100)
                    UNIQUE
                    NOT NULL,
 
                description TEXT,
 
                risk_level VARCHAR(50),
 
                investment_horizon VARCHAR(100),
 
                status VARCHAR(20)
                    NOT NULL
                    DEFAULT 'ACTIVE'
                    CHECK (
                        status IN (
                            'ACTIVE',
                            'INACTIVE'
                        )
                    ),
 
                created_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP,
 
                updated_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP
            );
        """)
 
 
        # =====================================================
        # 3. THEME ALLOCATION
        # =====================================================
 
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS theme_allocation (
 
                theme_allocation_id SERIAL PRIMARY KEY,
 
                theme_id INTEGER NOT NULL,
 
                asset_class_id INTEGER NOT NULL,
 
                allocation_percentage NUMERIC(6,2)
                    NOT NULL
                    CHECK (
                        allocation_percentage >= 0
                        AND
                        allocation_percentage <= 100
                    ),
 
                created_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP,
 
                updated_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP,
 
                CONSTRAINT fk_theme_allocation_theme
                    FOREIGN KEY (theme_id)
                    REFERENCES investment_theme(theme_id),
 
                CONSTRAINT fk_theme_allocation_asset
                    FOREIGN KEY (asset_class_id)
                    REFERENCES asset_class(asset_class_id),
 
                CONSTRAINT uq_theme_asset
                    UNIQUE (
                        theme_id,
                        asset_class_id
                    )
            );
        """)
 
 
        # =====================================================
        # 4. SECURITY MASTER
        # =====================================================
 
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS security_master (
 
                security_id SERIAL PRIMARY KEY,
 
                instrument_key VARCHAR(200)
                    UNIQUE
                    NOT NULL,
 
                exchange VARCHAR(20)
                    NOT NULL
                    DEFAULT 'NSE',
 
                symbol VARCHAR(100)
                    NOT NULL,
 
                security_name TEXT
                    NOT NULL,
 
                isin VARCHAR(30),
 
                instrument_type VARCHAR(50),
 
                asset_class_id INTEGER
                    NOT NULL,
 
                last_price NUMERIC(18,4),
 
                price_updated_at TIMESTAMP,

                data_source VARCHAR(30)
                    NOT NULL
                    DEFAULT 'MOCK',
 
                status VARCHAR(20)
                    NOT NULL
                    DEFAULT 'ACTIVE'
                    CHECK (
                        status IN (
                            'ACTIVE',
                            'INACTIVE'
                        )
                    ),
 
                created_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP,
 
                updated_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP,
 
                CONSTRAINT fk_security_asset
                    FOREIGN KEY (asset_class_id)
                    REFERENCES asset_class(asset_class_id)
            );
        """)


        # =====================================================
        # SECURITY MASTER - SAFE UPDATE FOR EXISTING DATABASE
        # =====================================================

        cursor.execute("""
            ALTER TABLE security_master
            ADD COLUMN IF NOT EXISTS data_source VARCHAR(30)
            NOT NULL
            DEFAULT 'MOCK';
        """)
 
 
        # =====================================================
        # 5. PORTFOLIO
        # =====================================================
 
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS portfolio (
 
                portfolio_id SERIAL PRIMARY KEY,
 
                portfolio_name VARCHAR(150)
                    NOT NULL,
 
                portfolio_manager VARCHAR(150)
                    NOT NULL,
 
                portfolio_type VARCHAR(20)
                    NOT NULL
                    CHECK (
                        portfolio_type IN (
                            'Amount',
                            'Weightage'
                        )
                    ),
 
                currency VARCHAR(10)
                    NOT NULL
                    DEFAULT 'INR',
 
                exchange VARCHAR(20)
                    NOT NULL
                    DEFAULT 'NSE',
 
                theme_id INTEGER
                    NOT NULL,
 
                benchmark_name VARCHAR(100)
                    NOT NULL
                    DEFAULT 'NIFTY 50',
 
                benchmark_key VARCHAR(200)
                    NOT NULL
                    DEFAULT 'NSE_INDEX|Nifty 50',
 
                benchmark_start_value NUMERIC(18,4),
 
                initial_investment NUMERIC(18,2)
                    NOT NULL
                    CHECK (
                        initial_investment > 0
                    ),
 
                available_balance NUMERIC(18,2)
                    NOT NULL
                    CHECK (
                        available_balance >= 0
                    ),
 
                portfolio_start_date DATE
                    NOT NULL,
 
                rebalancing_frequency VARCHAR(30)
                    NOT NULL
                    CHECK (
                        rebalancing_frequency IN (
                            'Daily',
                            'Weekly',
                            'Monthly',
                            'Quarterly',
                            'Half-Yearly',
                            'Yearly'
                        )
                    ),
 
                status VARCHAR(20)
                    NOT NULL
                    DEFAULT 'New'
                    CHECK (
                        status IN (
                            'New',
                            'Active',
                            'Closed'
                        )
                    ),
 
                created_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP,
 
                activated_at TIMESTAMP,
 
                closed_date DATE,
 
                CONSTRAINT fk_portfolio_theme
                    FOREIGN KEY (theme_id)
                    REFERENCES investment_theme(theme_id)
            );
        """)
 
 
        # =====================================================
        # 6. PORTFOLIO HOLDING
        # =====================================================
 
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS portfolio_holding (
 
                holding_id SERIAL PRIMARY KEY,
 
                portfolio_id INTEGER
                    NOT NULL,
 
                security_id INTEGER
                    NOT NULL,
 
                quantity INTEGER
                    NOT NULL
                    CHECK (
                        quantity > 0
                    ),
 
                average_buy_price NUMERIC(18,4)
                    NOT NULL,
 
                created_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP,
 
                updated_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP,
 
                CONSTRAINT fk_holding_portfolio
                    FOREIGN KEY (portfolio_id)
                    REFERENCES portfolio(portfolio_id),
 
                CONSTRAINT fk_holding_security
                    FOREIGN KEY (security_id)
                    REFERENCES security_master(security_id),
 
                CONSTRAINT uq_portfolio_security
                    UNIQUE (
                        portfolio_id,
                        security_id
                    )
            );
        """)
 
 
        # =====================================================
        # 7. PORTFOLIO TRANSACTION
        # =====================================================
 
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS portfolio_transaction (
 
                transaction_id SERIAL PRIMARY KEY,
 
                portfolio_id INTEGER
                    NOT NULL,
 
                security_id INTEGER
                    NOT NULL,
 
                transaction_type VARCHAR(10)
                    NOT NULL
                    CHECK (
                        transaction_type IN (
                            'BUY',
                            'SELL'
                        )
                    ),
 
                quantity INTEGER
                    NOT NULL
                    CHECK (
                        quantity > 0
                    ),
 
                price NUMERIC(18,4)
                    NOT NULL,
 
                transaction_amount NUMERIC(18,2)
                    NOT NULL,
 
                transaction_date DATE
                    NOT NULL,
 
                created_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP,
 
                CONSTRAINT fk_transaction_portfolio
                    FOREIGN KEY (portfolio_id)
                    REFERENCES portfolio(portfolio_id),
 
                CONSTRAINT fk_transaction_security
                    FOREIGN KEY (security_id)
                    REFERENCES security_master(security_id)
            );
        """)
 
 
        # =====================================================
        # 8. PORTFOLIO ALERT
        # =====================================================
 
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS portfolio_alert (
 
                alert_id SERIAL PRIMARY KEY,
 
                portfolio_id INTEGER
                    NOT NULL,
 
                asset_class_id INTEGER
                    NOT NULL,
 
                alert_type VARCHAR(50)
                    NOT NULL
                    DEFAULT 'ALLOCATION_DEVIATION',
 
                alert_message TEXT
                    NOT NULL,
 
                target_percentage NUMERIC(8,2)
                    NOT NULL,
 
                current_percentage NUMERIC(8,2)
                    NOT NULL,
 
                deviation_percentage NUMERIC(8,2)
                    NOT NULL,
 
                recommendation_action VARCHAR(20)
                    NOT NULL
                    CHECK (
                        recommendation_action IN (
                            'INCREASE',
                            'REDUCE',
                            'HOLD'
                        )
                    ),
 
                recommendation_amount NUMERIC(18,2)
                    NOT NULL
                    DEFAULT 0,
 
                status VARCHAR(20)
                    NOT NULL
                    DEFAULT 'NEW'
                    CHECK (
                        status IN (
                            'NEW',
                            'READ',
                            'RESOLVED'
                        )
                    ),
 
                generated_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP,
 
                resolved_at TIMESTAMP,
 
                CONSTRAINT fk_alert_portfolio
                    FOREIGN KEY (portfolio_id)
                    REFERENCES portfolio(portfolio_id),
 
                CONSTRAINT fk_alert_asset
                    FOREIGN KEY (asset_class_id)
                    REFERENCES asset_class(asset_class_id)
            );
        """)
 
 
        # =====================================================
        # 9. MARKET PRICE HISTORY
        #
        # Stores historical prices for:
        # - Real Equity CSV files
        # - Mock Equity ETF data
        # - Mock Debt ETF data
        # - Mock Gold ETF data
        # =====================================================

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS market_price_history (

                price_id BIGSERIAL PRIMARY KEY,

                security_id INTEGER
                    NOT NULL,

                trade_date DATE
                    NOT NULL,

                previous_close NUMERIC(18,4),

                open_price NUMERIC(18,4),

                high_price NUMERIC(18,4),

                low_price NUMERIC(18,4),

                last_price NUMERIC(18,4),

                close_price NUMERIC(18,4)
                    NOT NULL,

                average_price NUMERIC(18,4),

                volume BIGINT,

                source VARCHAR(30)
                    NOT NULL,

                created_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT fk_market_price_security
                    FOREIGN KEY (security_id)
                    REFERENCES security_master(security_id),

                CONSTRAINT uq_security_trade_date
                    UNIQUE (
                        security_id,
                        trade_date
                    )
            );
        """)


        # =====================================================
        # 10. BENCHMARK PRICE HISTORY
        #
        # Stores real NIFTY 50 historical close values.
        # =====================================================

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS benchmark_price_history (

                benchmark_price_id BIGSERIAL PRIMARY KEY,

                benchmark_code VARCHAR(50)
                    NOT NULL,

                benchmark_name VARCHAR(100)
                    NOT NULL,

                price_date DATE
                    NOT NULL,

                close_value NUMERIC(18,4)
                    NOT NULL,

                source VARCHAR(30)
                    NOT NULL
                    DEFAULT 'REAL_CSV',

                created_at TIMESTAMP
                    NOT NULL
                    DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT uq_benchmark_price_date
                    UNIQUE (
                        benchmark_code,
                        price_date
                    )
            );
        """)


        # =====================================================
        # INDEXES FOR FAST SEARCH / PRICE LOOKUP
        # =====================================================

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_security_symbol
            ON security_master(symbol);
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_security_asset_class
            ON security_master(asset_class_id);
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_market_security_date
            ON market_price_history(
                security_id,
                trade_date
            );
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_benchmark_code_date
            ON benchmark_price_history(
                benchmark_code,
                price_date
            );
        """)


        conn.commit()
 
        print("All 10 tables created successfully.")
 
 
    except Exception as error:
 
        conn.rollback()
 
        print(
            "Error while creating tables:",
            error
        )
 
        raise
 
 
    finally:
 
        cursor.close()
        conn.close()
 
def seed_asset_classes():
 
    conn = get_db_connection()
    cursor = conn.cursor()
 
    try:
 
        asset_classes = [
 
            (
                "Equity",
                "Direct investment in NSE listed company shares",
                "Listed Equity Shares",
                "Ownership shares of NSE listed companies",
                "High",
                "Long Term"
            ),
 
            (
                "Equity ETF",
                "Exchange traded funds investing mainly in equities",
                "Equity Exchange Traded Fund",
                "ETF units traded on NSE representing equity portfolios",
                "Moderate to High",
                "Medium to Long Term"
            ),
 
            (
                "Debt ETF",
                "Exchange traded funds investing in debt securities",
                "Debt Exchange Traded Fund",
                "ETF units representing bonds, government securities or liquid instruments",
                "Low to Moderate",
                "Short to Medium Term"
            ),
 
            (
                "Gold ETF",
                "Exchange traded funds tracking gold prices",
                "Gold Exchange Traded Fund",
                "ETF units representing gold exposure",
                "Moderate",
                "Medium to Long Term"
            ),
 
            (
                "Cash",
                "Uninvested portfolio balance",
                "Cash Balance",
                "Money currently available for future investment",
                "Low",
                "Short Term"
            )
        ]
 
 
        for item in asset_classes:
 
            cursor.execute("""
                INSERT INTO asset_class (
 
                    asset_class_name,
                    asset_description,
                    sub_asset_class,
                    sub_asset_description,
                    risk_level,
                    investment_horizon
 
                )
                VALUES (
                    %s, %s, %s,
                    %s, %s, %s
                )
 
                ON CONFLICT (
                    asset_class_name
                )
                DO NOTHING;
            """, item)
 
 
        conn.commit()
 
        print(
            "Asset classes inserted successfully."
        )
 
 
    except Exception as error:
 
        conn.rollback()
        print(error)
        raise
 
 
    finally:
 
        cursor.close()
        conn.close()
 
def seed_themes():
 
    conn = get_db_connection()
    cursor = conn.cursor()
 
    try:
 
        themes = [
 
            (
                "Conservative",
                "Focuses mainly on capital preservation with lower risk.",
                "Low",
                "Short to Medium Term"
            ),
 
            (
                "Moderately Conservative",
                "Focuses on stability with limited growth exposure.",
                "Low to Moderate",
                "Medium Term"
            ),
 
            (
                "Aggressive",
                "Focuses mainly on growth through higher equity exposure.",
                "High",
                "Long Term"
            ),
 
            (
                "Moderately Aggressive",
                "Balances growth-oriented investments with some stability.",
                "Moderate to High",
                "Medium to Long Term"
            ),
 
            (
                "Very Aggressive",
                "Targets maximum long-term growth with very high equity exposure.",
                "Very High",
                "Long Term"
            )
        ]
 
 
        for item in themes:
 
            cursor.execute("""
                INSERT INTO investment_theme (
 
                    theme_name,
                    description,
                    risk_level,
                    investment_horizon
 
                )
                VALUES (
                    %s, %s, %s, %s
                )
 
                ON CONFLICT (
                    theme_name
                )
                DO NOTHING;
            """, item)
 
 
        conn.commit()
 
        print(
            "Five investment themes inserted successfully."
        )
 
 
    except Exception as error:
 
        conn.rollback()
        print(error)
        raise
 
 
    finally:
 
        cursor.close()
        conn.close()
 
def seed_theme_allocations():
 
    conn = get_db_connection()
    cursor = conn.cursor()
 
    try:
 
        # -----------------------------------------
        # Get Asset Class IDs
        # -----------------------------------------
 
        cursor.execute("""
            SELECT
                asset_class_id,
                asset_class_name
            FROM asset_class;
        """)
 
        asset_rows = cursor.fetchall()
 
        asset_ids = {}
 
        for row in asset_rows:
 
            asset_ids[
                row["asset_class_name"]
            ] = row["asset_class_id"]
 
 
        # -----------------------------------------
        # Get Theme IDs
        # -----------------------------------------
 
        cursor.execute("""
            SELECT
                theme_id,
                theme_name
            FROM investment_theme;
        """)
 
        theme_rows = cursor.fetchall()
 
        theme_ids = {}
 
        for row in theme_rows:
 
            theme_ids[
                row["theme_name"]
            ] = row["theme_id"]
 
 
        # -----------------------------------------
        # Initial Allocation Rules
        # -----------------------------------------
 
        allocations = {
 
            "Conservative": {
                "Equity": 10,
                "Equity ETF": 10,
                "Debt ETF": 45,
                "Gold ETF": 15,
                "Cash": 20
            },
 
            "Moderately Conservative": {
                "Equity": 20,
                "Equity ETF": 15,
                "Debt ETF": 35,
                "Gold ETF": 15,
                "Cash": 15
            },
 
            "Aggressive": {
                "Equity": 60,
                "Equity ETF": 15,
                "Debt ETF": 10,
                "Gold ETF": 5,
                "Cash": 10
            },
 
            "Moderately Aggressive": {
                "Equity": 40,
                "Equity ETF": 20,
                "Debt ETF": 20,
                "Gold ETF": 10,
                "Cash": 10
            },
 
            "Very Aggressive": {
                "Equity": 70,
                "Equity ETF": 15,
                "Debt ETF": 5,
                "Gold ETF": 5,
                "Cash": 5
            }
        }
 
 
        # -----------------------------------------
        # Insert
        # -----------------------------------------
 
        for theme_name in allocations:
 
            theme_id = theme_ids[
                theme_name
            ]
 
            theme_allocations = allocations[
                theme_name
            ]
 
 
            # Safety validation
            total_percentage = sum(
                theme_allocations.values()
            )
 
            if total_percentage != 100:
 
                raise ValueError(
                    f"{theme_name} allocation "
                    f"must total 100%. "
                    f"Current total = "
                    f"{total_percentage}%"
                )
 
 
            for asset_name in theme_allocations:
 
                asset_class_id = asset_ids[
                    asset_name
                ]
 
                percentage = (
                    theme_allocations[
                        asset_name
                    ]
                )
 
 
                cursor.execute("""
                    INSERT INTO theme_allocation (
 
                        theme_id,
                        asset_class_id,
                        allocation_percentage
 
                    )
                    VALUES (
                        %s, %s, %s
                    )
 
                    ON CONFLICT (
                        theme_id,
                        asset_class_id
                    )
 
                    DO UPDATE SET
 
                        allocation_percentage =
                            EXCLUDED.allocation_percentage,
 
                        updated_at =
                            CURRENT_TIMESTAMP;
                """, (
                    theme_id,
                    asset_class_id,
                    percentage
                ))
 
 
        conn.commit()
 
        print(
            "Theme allocations inserted successfully."
        )
 
 
    except Exception as error:
 
        conn.rollback()
        print(error)
        raise
 
 
    finally:
 
        cursor.close()
        conn.close()
 
def initialize_database():
 
    print(
        "Initializing Portfolio database..."
    )
 
    create_tables()
 
    seed_asset_classes()
 
    seed_themes()
 
    seed_theme_allocations()
 
    print(
        "Database initialization completed."
    )

if __name__ == "__main__":

    initialize_database()
