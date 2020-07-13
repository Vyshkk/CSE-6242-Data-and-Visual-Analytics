## Data and Visual Analytics - Homework 4
## Georgia Institute of Technology
## Applying ML algorithms to detect eye state

import numpy as np
import pandas as pd
import time

from sklearn.model_selection import cross_val_score, GridSearchCV, cross_validate, train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.svm import SVC
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, normalize
from sklearn.decomposition import PCA

######################################### Reading and Splitting the Data ###############################################
# XXX
# TODO: Read in all the data. Replace the 'xxx' with the path to the data set.
# XXX
data = pd.read_csv('/Users/jayalakshmy/Desktop/hw4-skeleton/Q3/eeg_dataset.csv')

# Separate out the x_data and y_data.
x_data = data.loc[:, data.columns != "y"]
y_data = data.loc[:, "y"]

# The random state to use while splitting the data.
random_state = 100

# XXX
# TODO: Split 70% of the data into training and 30% into test sets. Call them x_train, x_test, y_train and y_test.
# Use the train_test_split method in sklearn with the parameter 'shuffle' set to true and the 'random_state' set to 100.
x_train,x_test,y_train,y_test=train_test_split(x_data,y_data,test_size=.30,train_size=.70,random_state=100,shuffle=True)

# XXX


# ############################################### Linear Regression ###################################################
# XXX
# TODO: Create a LinearRegression classifier and train it.
reg=LinearRegression()
reg.fit(x_train,y_train)
# XXX


# XXX
# TODO: Test its accuracy (on the training set) using the accuracy_score method.
# TODO: Test its accuracy (on the testing set) using the accuracy_score method.
# Note: Round the output values greater than or equal to 0.5 to 1 and those less than 0.5 to 0. You can use y_predict.round() or any other method.
y1_train=reg.predict(x_train).round()
y1_test=reg.predict(x_test).round()
score_train1=accuracy_score(y1_train,y_train)
score_test1=accuracy_score(y1_test,y_test)
print("Linear Regression Classifier train acuuracy:",score_train1)
print("Linear Regression Classifier test acuuracy:",score_test1)
# XXX


# ############################################### Random Forest Classifier ##############################################
# XXX
# TODO: Create a RandomForestClassifier and train it.
clf=RandomForestClassifier()
clf.fit(x_train,y_train)
# XXX


# XXX
# TODO: Test its accuracy on the training set using the accuracy_score method.
# TODO: Test its accuracy on the test set using the accuracy_score method.
y2_train=clf.predict(x_train)
y2_test=clf.predict(x_test)
score_train2=accuracy_score(y2_train,y_train)
score_test2=accuracy_score(y2_test,y_test)
print("Random Forest Classifier train acuuracy:",score_train2)
print("Random Forest Classifier test acuuracy:",score_test2)
# XXX


# XXX
# TODO: Determine the feature importance as evaluated by the Random Forest Classifier.
#       Sort them in the descending order and print the feature numbers. The report the most important and the least important feature.
#       Mention the features with the exact names, e.g. X11, X1, etc.
#       Hint: There is a direct function available in sklearn to achieve this. Also checkout argsort() function in Python.
imp=clf.feature_importances_
#print("feature import:",imp)
index=np.argsort(-imp)
for i in index:
	print(x_train.columns[i])
print("RFC most important feature:",x_train.columns[index[0]])
print("RFC least important feature:",x_train.columns[index[-1]])
# XXX


# XXX
# TODO: Tune the hyper-parameters 'n_estimators' and 'max_depth'.
#       Print the best params, using .best_params_, and print the best score, using .best_score_.
para_g={'n_estimators':[200,250,300,350,400],
		'max_depth':[50,60,70,80,90,100]}
rfc=RandomForestClassifier()
grid_search=GridSearchCV(estimator=rfc,param_grid=para_g,cv=10,n_jobs=-1)
grid_search.fit(x_train,y_train)
y_grid=grid_search.predict(x_test)

print("RFC- Best para:",grid_search.best_params_)
print("RFC-best score using best parameters:",grid_search.cv_results_)
# XXX


# ############################################ Support Vector Machine ###################################################
# XXX
# TODO: Pre-process the data to standardize or normalize it, otherwise the grid search will take much longer
# TODO: Create a SVC classifier and train it.
scaler=StandardScaler().fit(x_train)
x_tr_standard=scaler.transform(x_train)
x_te_standard=scaler.transform(x_test)
svcclass=SVC().fit(x_tr_standard,y_train)

# XXX


# XXX
# TODO: Test its accuracy on the training set using the accuracy_score method.
# TODO: Test its accuracy on the test set using the accuracy_score method.
y3_train=svcclass.predict(x_tr_standard)
y3_test=svcclass.predict(x_te_standard)
score_train3=accuracy_score(y3_train,y_train)
score_test3=accuracy_score(y3_test,y_test)
print("SVC train data accuracy:",score_train3)
print("SVC test data accuracy:",score_test3)
# XXX


# XXX
# TODO: Tune the hyper-parameters 'C' and 'kernel' (use rbf and linear).
#       Print the best params, using .best_params_, and print the best score, using .best_score_.
sv=SVC()
para_svc={'C':[.001,.01,.1,10,100],'kernel':['linear','rbf']}
gs_svc=GridSearchCV(estimator=sv,param_grid=para_svc,cv=10)
gs_svc.fit(x_tr_standard,y_train)
print("SVC- Best para:",gs_svc.best_params_)
y_grid2=gs_svc.predict(x_te_standard)
print("SVC-grid search results:",gs_svc.cv_results_)
# XXX

# ######################################### Principal Component Analysis #################################################
# XXX
# TODO: Perform dimensionality reduction of the data using PCA.
#       Set parameters n_component to 10 and svd_solver to 'full'. Keep other parameters at their default value.
#       Print the following arrays:
#       - Percentage of variance explained by each of the selected components
#       - The singular values corresponding to each of the selected components.
pca=PCA(n_components=10,svd_solver='full')
pca.fit(x_data)
print("PCA- percentage variance:",pca.explained_variance_ratio_)
print("PCA- singular values:",pca.singular_values_)
# XXX


