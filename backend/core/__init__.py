import pymysql

# Install PyMySQL as MySQLdb
pymysql.install_as_MySQLdb()

# Patch version check (PyMySQL reports old version, but it's compatible)
pymysql.version_info = (2, 2, 1, "final", 0)
