// Databricks notebook source
// MAGIC %md
// MAGIC #### Q2 - Skeleton Scala Notebook
// MAGIC This template Scala Notebook is provided to provide a basic setup for reading in / writing out the graph file and help you get started with Scala.  Clicking 'Run All' above will execute all commands in the notebook and output a file 'examplegraph.csv'.  See assignment instructions on how to to retrieve this file. You may modify the notebook below the 'Cmd2' block as necessary.
// MAGIC 
// MAGIC #### Precedence of Instruction
// MAGIC The examples provided herein are intended to be more didactic in nature to get you up to speed w/ Scala.  However, should the HW assignment instructions diverge from the content in this notebook, by incident of revision or otherwise, the HW assignment instructions shall always take precedence.  Do not rely solely on the instructions within this notebook as the final authority of the requisite deliverables prior to submitting this assignment.  Usage of this notebook implicitly guarantees that you understand the risks of using this template code. 

// COMMAND ----------

/*
DO NOT MODIFY THIS BLOCK
This assignment can be completely accomplished with the following includes and case class.
Do not modify the %language prefixes, only use Scala code within this notebook.  The auto-grader will check for instances of <%some-other-lang>, e.g., %python
*/
import org.apache.spark.sql.functions.desc
import org.apache.spark.sql.functions._
case class edges(Source: String, Target: String, Weight: Int)
import spark.implicits._

// COMMAND ----------

/* 
Create an RDD of graph objects from our toygraph.csv file, convert it to a Dataframe
Replace the 'examplegraph.csv' below with the name of Q2 graph file.
*/

val df = spark.read.textFile("/FileStore/tables/bitcoinotc.csv") 
  .map(_.split(","))
  .map(columns => edges(columns(0), columns(1), columns(2).toInt)).toDF()

// COMMAND ----------

// Insert blocks as needed to further process your graph, the division and number of code blocks is at your discretion.

// COMMAND ----------

var df1=df.dropDuplicates();
df1.show();
// e.g. eliminate duplicate rows

// COMMAND ----------

df1=df1.filter("Weight>=5");
df1.show();

// e.g. filter nodes by edge weight >= supplied threshold in assignment instructions

// COMMAND ----------

//Weighted out
var df2=df1.groupBy("Source").agg(sum("Weight") as "s1");
df2=df2.sort($"Source".asc);
val df5=Seq((6,0)).toDF("Source","s1");
df2=df2.union(df5);


//Weighted in
var df3=df1.groupBy("Target").agg(sum("Weight") as "s2");
df3=df3.sort($"Target".asc);

//Weighted total
var df4=Seq((1),(2),(3),(4),(5),(6)).toDF("nodes");
df4=df4.join(df3,df3("Target")===df4("nodes"));
df4=df4.join(df2,df2("Source")===df4("nodes"));//
df4=df4.withColumn("totalwght",df4.col("s1")+df4.col("s2"));
df4=df4.drop(df4.col("Source"));
df4=df4.drop(df4.col("Target"));
df4=df4.select($"nodes",$"totalwght");
df4=df4.orderBy($"totalwght".desc,$"nodes".asc);
df2=df2.orderBy($"s1".desc,$"Source".asc);
df3=df3.orderBy($"s2".desc,$"Target".asc);

// find node with highest weighted-in-degree, if two or more nodes have the same weighted-in-degree, report the one with the lowest node id
// find node with highest weighted-out-degree, if two or more nodes have the same weighted-out-degree, report the one with the lowest node id
// find node with highest weighted-total degree, if two or more nodes have the same weighted-total-degree, report the one with the lowest node id

// COMMAND ----------


val dat=Seq((df3.select("Target").as[String].first(),df3.select("s2").as[String].first(),"i"),(df2.select("Source").as[String].first(),df2.select("s1").as[String].first(),"o"),(df4.select("nodes").as[String].first(),df4.select("totalwght").as[String].first(),"t")).toDF("v","d","c");


/*
Create a dataframe to store your results
Schema: 3 columns, named: 'v', 'd', 'c' where:
'v' : vertex id
'd' : degree calculation (an integer value.  one row with highest weighted-in-degree, a row w/ highest weighted-out-degree, a row w/ highest weighted-total-degree )
'c' : category of degree, containing one of three string values:
                                                'i' : weighted-in-degree
                                                'o' : weighted-out-degree                                                
                                                't' : weighted-total-degree
- Your output should contain exactly three rows.  
- Your output should contain exactly the column order specified.
- The order of rows does not matter.
                                                
A correct output would be:

v,d,c
4,15,i
2,20,o
2,30,t

whereas:
- Node 2 has highest weighted-out-degree with a value of 20
- Node 4 has highest weighted-in-degree with a value of 15
- Node 2 has highest weighted-total-degree with a value of 30

*/

// COMMAND ----------

display(dat)
