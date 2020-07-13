package edu.gatech.cse6242;

import org.apache.hadoop.fs.Path;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.util.*;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import java.io.IOException;
import org.apache.hadoop.mapred.OutputCollector;
import org.apache.hadoop.mapred.Reporter;

public class Q1 {

public static class TokenizerMapper
       extends Mapper<LongWritable, Text, Text, IntWritable>{

    //private final static IntWritable one = new IntWritable(1);
    private Text n = new Text();
    
     public void map(LongWritable key, Text value, Context context) 
     throws IOException, InterruptedException {
      String t = value.toString();
      String itr[]=t.split("\t");
      
      n.set(itr[1]);
      int weight=Integer.parseInt(itr[2]);
      
       // output.collect(n,new IntWritable(weight));
       context.write(n,new IntWritable(weight));
      //System.out.println("<"+n+","+weight+">");
    }
  }



 public static class IntSumReducer
       extends Reducer<Text,IntWritable,Text,IntWritable> {
    private IntWritable result = new IntWritable();

    public void reduce(Text key, Iterable<IntWritable> values, Context context
                       ) throws IOException, InterruptedException {
      int sum = 0;
      for (IntWritable val : values) {
        sum += val.get();
      }
      result.set(sum);
      context.write(key,result);
     // output.collect(key,result);
      //System.out.println("<"+key+","+result+">");
    }
  }
  
  
  

  public static void main(String[] args) throws Exception {
    Configuration conf = new Configuration();
    Job job = Job.getInstance(conf, "Q1");

    /* TODO: Needs to be implemented */
    job.setJarByClass(Q1.class);
    job.setMapperClass(TokenizerMapper.class);
    job.setCombinerClass(IntSumReducer.class);
    job.setReducerClass(IntSumReducer.class);
    job.setOutputKeyClass(Text.class);
    job.setOutputValueClass(IntWritable.class);

    FileInputFormat.addInputPath(job, new Path(args[0]));
    FileOutputFormat.setOutputPath(job, new Path(args[1]));
    System.exit(job.waitForCompletion(true) ? 0 : 1);
  }
}


