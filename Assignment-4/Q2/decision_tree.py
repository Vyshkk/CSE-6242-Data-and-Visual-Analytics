from util import entropy, information_gain, partition_classes
import numpy as np 
import ast

class DecisionTree(object):
    def __init__(self):
        # Initializing the tree as an empty dictionary or list, as preferred
        #self.tree = []
        #self.tree = {}
        self.tree = {}
        pass

    def learn(self, X, y):
        # TODO: Train the decision tree (self.tree) using the the sample X and labels y
        # You will have to make use of the functions in utils.py to train the tree
        
        # One possible way of implementing the tree:
        #    Each node in self.tree could be in the form of a dictionary:
        #       https://docs.python.org/2/library/stdtypes.html#mapping-types-dict
        #    For example, a non-leaf node with two children can have a 'left' key and  a 
        #    'right' key. You can add more keys which might help in classification
        #    (eg. split attribute and split value)

        if y==[]:
            return

        temp_y=y[0];k=0;
        for i in range(len(y)):
            if y[i]!=temp_y:
                k=1
                break   
        if k==0:
            self.tree['label']=y[0]
           # print(y)
            return
    	
        ig_final=0
        avg=[0]*len(X[0])
        ig=[0.0]*len(X[0])

        for j in range(len(X[0])):
            avg[j]=0;
            new_list = [item[j] for item in X]
            v=np.unique(new_list)
            if not isinstance(v[0],float):
                count=dict((el,0) for el in v)
                for i in range(len(X)):
                    count[X[i][j]]+=1
                avg[j]=max(count.values())
                x_l,x_r,y_l,y_r=partition_classes(X,y,j,avg[j])

            elif isinstance(v[0],float):
                for i in range(len(X)):
                    avg[j]=avg[j]+X[i][j]
                avg[j]=avg[j]/len(X)
                x_l,x_r,y_l,y_r=partition_classes(X,y,j,avg[j])

            ig[j]=information_gain(y,[[y_l],[y_r]])


        #print(ig)
        index=np.argsort(ig)
        ig_final=index[-1]
        x_l,x_r,y_l,y_r=partition_classes(X,y,ig_final,avg[ig_final])    
		
        #print(y_l)
        self.tree['left']=DecisionTree()
        self.tree['right']=DecisionTree()
        self.tree['left'].learn(x_l,y_l)
        self.tree['right'].learn(x_r,y_r)
        self.tree['attr']=ig_final
        self.tree['value']=avg[ig_final]
 	
        	
        			
        pass


		
		


    def classify(self, record):
        # TODO: classify the record using self.tree and return the predicted label
    	
        root= self.tree
        while 'value' in root:
            split_attr=root['attr'];split_v=root['value'];
            if isinstance(split_v,float):
                if record[split_attr]>split_v:
                    root=root['right'].tree
                else:
                    root=root['left'].tree
            elif isinstance(record[split_attr],int):
                if record[split_attr]==root['value']:
                    root=root['left'].tree
                else:
                    root=root['right'].tree
        #print(root['label'])
        return root['label']
    				
        pass
