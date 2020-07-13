package edu.gatech.cse6242;

import org.apache.hadoop.fs.Path;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.util.*;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import java.io.IOException;
import java.util.Iterator;

public class Q4 {


public static class TokenizerMapper
       extends Mapper<LongWritable, Text, Text, IntWritable>{

    private final static IntWritable one = new IntWritable(1);
    private final static IntWritable two=new IntWritable(1);
    private Text n1 = new Text();
    private Text n2 = new Text();
 
    
     public void map(LongWritable key, Text value, Context context) 
     throws IOException, InterruptedException {
      String t = value.toString();
      String itr[]=t.split("\t");
      
      
      n1.set(itr[0]);
      n2.set(itr[1]);

     int o=0;
     int i=1;
      
       context.write(n1,new IntWritable(o));
       context.write(n2,new IntWritable(i));
   //   System.out.println("<"+n1+","+o+">");
    }
  }
  
  
   public static class IntSumReducer
       extends Reducer<Text,IntWritable,Text,IntWritable> {
   
    public void reduce(Text key, Iterable<IntWritable> values, Context context
                       ) throws IOException, InterruptedException {
      int counto=0;int counti=0;
            for (IntWritable val : values) {int v=val.get();
        if(v==0)
        {counto += 1;}
        else
        {counti++;}
      }
      
  
Text keytext=new Text(key+"\t");
      context.write(keytext,new IntWritable(counto-counti));

    //System.out.println("<"+key+","+counti+","+counto+">");
    }
  }
  
  
  
    public static class DifferenceMapper
       extends Mapper<LongWritable, Text, Text, IntWritable>{

    private final static IntWritable one = new IntWritable(1);
    private Text diff=new Text();
     
     public void map(LongWritable key, Text value, Context context) 
     throws IOException, InterruptedException {
      String w=value.toString();
      String r[]=w.split("\t");
      diff.set(r[2]);
      
       
       context.write(diff,one);
      
    }
  }
  
     public static class IntAddition
       extends Reducer<Text,IntWritable,Text,IntWritable> {
      //extends Reducer<IntWritable,IntWritable,IntWritable,IntWritable> {
private IntWritable result = new IntWritable();
private IntWritable va = new IntWritable();
    public void reduce(Text key, Iterable<IntWritable> values, Context context
                       ) throws IOException, InterruptedException {
       int sum = 0;
      for (IntWritable val : values) {
        sum+=val.get();
      }
      result.set(sum);
      
      Text keyt=new Text(key+"\t");
      context.write(keyt,result);
        
      }     


  }
  


  public static void main(String[] args) throws Exception {
    Configuration conf1 = new Configuration();
    Job job1 = Job.getInstance(conf1, "Q4");

    /* TODO: Needs to be implemented */
      
job1.setJarByClass(Q4.class);
job1.setMapperClass(TokenizerMapper.class);
job1.setReducerClass(IntSumReducer.class);
job1.setOutputKeyClass(Text.class);
job1.setOutputValueClass(IntWritable.class);
FileInputFormat.addInputPath(job1, new Path(args[0]));
FileOutputFormat.setOutputPath(job1, new Path("out1"));
//System.exit(job1.waitForCompletion(true) ? 0 : 1);
int code=job1.waitForCompletion(true) ? 0 : 1;

Configuration conf2 = new Configuration();  
Job job2 = Job.getInstance(conf2, "Q4");
job2.setJarByClass(Q4.class);
job2.setMapperClass(DifferenceMapper.class);
job2.setCombinerClass(IntAddition.class);
job2.setReducerClass(IntAddition.class);
job2.setOutputKeyClass(Text.class);
job2.setOutputValueClass(IntWritable.class);
FileInputFormat.addInputPath(job2, new Path("out1"));
FileOutputFormat.setOutputPath(job2, new Path(args[1]));
System.exit(job2.waitForCompletion(true) ? 0 : 1);


  
  }
}
