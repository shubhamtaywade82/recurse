class AddAuthAndSharingToTables < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :password_digest, :string
    add_column :users, :admin, :boolean, default: false

    add_column :mock_interviews, :share_token, :string
    add_column :mock_interviews, :is_shared, :boolean, default: false
    add_index :mock_interviews, :share_token, unique: true
  end
end
