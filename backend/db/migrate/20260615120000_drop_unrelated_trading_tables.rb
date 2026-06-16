# frozen_string_literal: true

class DropUnrelatedTradingTables < ActiveRecord::Migration[8.1]
  TRADING_TABLES = %w[
    portfolio_ledger_entries
    fills
    orders
    positions
    trades
    generated_signals
    trading_sessions
    portfolios
    paper_fills
    paper_orders
    paper_positions
    paper_trading_signals
    paper_wallet_ledger_entries
    paper_wallets
    paper_product_snapshots
    setting_changes
    settings
    strategy_params
    symbol_configs
  ].freeze

  def up
    TRADING_TABLES.each do |table|
      drop_table table, if_exists: true, force: :cascade
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration, "Trading tables were unrelated legacy schema and are not restored."
  end
end
