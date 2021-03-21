<?php
namespace generic;
use PDO, PDOStatement, PDOException;

/**
 * A framework class to access any table in an SQL database.
 * 
 * Given a PDO, a string representing the table name, and a string represeting the
 * name of the primary key, this class will immediately be able to access the database.
 * It contains the common methods/interactions with a database.
 * 
 * @since 1.0.0
 */
class DatabaseTable
{
    public function __construct(
        private PDO $pdo,
        private string $table,
        private string $primaryKey
    ) {}

    /**
     * Receives an SQL statement and executes it.
     * 
     * @since 1.0.0
     * 
     * @param string $sql The SQL statement to be excuted.
     * @param array $parameters the parameters to be inserted in the prepared statement.
     * 
     * @return PDOStatement $query The result of the exectuted query.
     */
    private function query($sql, $parameters = []): PDOStatement
    {
        $query = $this->pdo->prepare($sql);
        $query->execute($parameters);
        return $query;
    }

    /**
     * Returns the number of records in a table.
     * 
     * @since 1.0.0
     * 
     * @return int The number of records in a table.
     */
    public function total()
    {
        $query = $this->query("SELECT COUNT(*) FROM $this->table");
        return $query->fetch()[0];
    }

    /**
     * Return the record that matches with the given primary key value.
     * 
     * @since 1.0.0
     * 
     * @param mixed $value The primary key value.
     * 
     * @return PDOStatement The record that matches with the given primary key.
     */
    public function findById($value)
    {
        $query = "SELECT * FROM $this->table WHERE $this->primaryKey = :value";
        $parameters = ['value' => $value];

        return $this->query($query, $parameters)->fetch();
    }

    /**
     * Inserts a record into the database.
     * 
     * @since 1.0.0
     * 
     * @param array $fields Contains the values of the record to be inserted into the database with the keys 
     *                      of the arrays being the table's column names.
     */
    private function insert($fields)
    {
        $query = 'INSERT INTO `' . $this->table . '` (';

        foreach ($fields as $key => $value) {
            $query .= '`' . $key . '`,';
        }

        $query = rtrim($query, ',');

        $query .= ') VALUES (';


        foreach ($fields as $key => $value) {
            $query .= ':' . $key . ',';
        }

        $query = rtrim($query, ',');

        $query .= ')';

        $fields = $this->processDates($fields);

        $this->query($query, $fields);
    }

    /**
     * Updates a record into the database.
     * 
     * @since 1.0.0
     * 
     * @param array $fields Contains the values of the record to be updated in the database with the keys 
     *                      of the arrays being the table's column names.
     */
    private function update($fields)
    {
        $query = ' UPDATE `' . $this->table . '` SET ';

        foreach ($fields as $key => $value) {
            $query .= '`' . $key . '` = :' . $key . ',';
        }

        $query = rtrim($query, ',');

        $query .= ' WHERE `' . $this->primaryKey . '` = :primaryKey';

        //Set the :primaryKey variable
        $fields['primaryKey'] = $fields['id'];

        $fields = $this->processDates($fields);

        $this->query($query, $fields);
    }

    /**
     * Deletes a record in the database.
     * 
     * @since 1.0.0
     * 
     * @param mixed $id Contains the primary key value of the record to be deleted.
     */
    public function delete($id)
    {
        $parameters = [':id' => $id];

        $this->query('DELETE FROM `' . $this->table . '` WHERE `' . $this->primaryKey . '` = :id', $parameters);
    }

    /**
     * Returns all the records in the database.
     * 
     * @since 1.0.0
     * 
     * @return PDOStatement An array contaning all the records in the database.
     */
    public function findAll()
    {
        $result = $this->query('SELECT * FROM ' . $this->table);

        return $result->fetchAll();
    }

    /**
     * Standardizes any DateTime object in the values to match with the format
     * required by the database.
     * 
     * @since 1.0.0
     * 
     * @return array $fields The same set of elements, but all DataTime objects have been formatted.
     */
    private function processDates($fields)
    {
        foreach ($fields as $key => $value) {
            if ($value instanceof \DateTime) {
                $fields[$key] = $value->format('Y-m-d');
            }
        }

        return $fields;
    }

    /**
     * Updates or inserts a record into the database.
     * 
     * A public method for convenience since users will not have to think
     * whether to use update or insert while coding.
     * 
     * @since 1.0.0
     * 
     * @param array $record Contains the values of the record to be updated in the database with the keys 
     *                      of the arrays being the table's column names.
     */
    public function save($record)
    {
        try {
            if ($record[$this->primaryKey] == '') {
                $record[$this->primaryKey] = null;
            }
            $this->insert($record);
        } catch (PDOException $e) {
            $this->update($record);
        }
    }
}